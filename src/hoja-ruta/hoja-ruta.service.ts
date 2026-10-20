import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, IsNull, Not, Repository } from 'typeorm';
import {
  ESTADO_HOJA_EN_PROCESO,
  ESTADO_HOJA_FINALIZADA,
  ESTADO_HOJA_PENDIENTE,
  HojaRuta,
} from './hoja-ruta.entity';
import { GoogleMapsService } from './google-maps.service';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { HistorialKmVehiculo } from '../historial-km-vehiculo/historial-km-vehiculo.entity';
import { DiaHojaRutaQueryDto, HistoricoHojaRutaQueryDto } from './dto/hoja-ruta.dto';
import { HojaRutaTurno } from './hoja-ruta-turno.entity';
import { Retiro } from '../retiro/retiro.entity';
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { TurnoService } from '../turno/turno.service';
import { ESTADO_TURNO } from '../common/constants/estados';

// Solo los turnos con el retiro confirmado forman parte de la hoja de ruta
const ESTADO_TURNO_RETIRO_CONFIRMADO = ESTADO_TURNO.RETIRO_CONFIRMADO.toLowerCase();
// Tope del rango consultado: cada hoja puede implicar una consulta a Google Directions
const MAX_DIAS_RANGO = 31;

export interface ParadaHojaRuta {
  turnoId: number;
  orden: number;
  donante: string;
  direccion: string;
  sinDireccion: boolean;
  fechaHora: Date;
  estadoTurno: string;
  // El transportista ya confirmó el retiro de este turno
  retirado: boolean;
  // Constancia de retiro generada al confirmar el retiro (null mientras esté pendiente)
  constanciaId: number | null;
}

// Un punto del recorrido tal como se envía a Google: origen, paradas intermedias y destino
export interface PuntoRecorrido {
  rol: 'origen' | 'parada' | 'destino';
  etiqueta: string;
  direccion: string;
  donante: string | null;
}

export interface HojaRutaDia {
  empleadoTransportistaId: number;
  transportista: { nombre: string; apellido: string; cuitDni: string | null } | null;
  vehiculo: { id: number; patente: string; marca: string; modelo: string; kilometraje: number | null } | null;
  fecha: string;
  // Sin hoja persistida (días pasados o futuros) se muestra como Pendiente
  estado: string;
  paradas: ParadaHojaRuta[];
  cantidadPedidos: number;
  kmEstimados: number | null;
  mapsUrl: string | null;
  embedUrl: string | null;
  recorrido: PuntoRecorrido[];
  // Base configurada (HOJA_RUTA_ORIGEN) desde donde sale y a donde vuelve la ruta
  origen: string | null;
  rutaOptimizada: boolean;
  advertencia?: string;
  hojaRuta: {
    id: number;
    estado: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    kmInicial: number | null;
    kmFinal: number | null;
    kmReales: number | null;
    kmEstimado: number | null;
  } | null;
}

export interface HojaRutaHistorico {
  id: number;
  fecha: string;
  empleadoTransportistaId: number;
  transportista: string;
  vehiculo: { id: number; patente: string; marca: string; modelo: string } | null;
  cantidadPedidos: number;
  kmEstimados: number | null;
  kmInicial: number | null;
  kmFinal: number | null;
  kmReales: number | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: string;
}

const HOJA_RELATIONS = ['empleadoTransportista', 'empleadoTransportista.empleado', 'vehiculo', 'historialKm'];

@Injectable()
export class HojaRutaService {
  constructor(
    @InjectRepository(HojaRuta) private readonly hojaRepository: Repository<HojaRuta>,
    @InjectRepository(Turno) private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Donacion) private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepository: Repository<Vehiculo>,
    private readonly dataSource: DataSource,
    private readonly mapsService: GoogleMapsService,
    private readonly turnoService: TurnoService,
  ) {}

  private hoy(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private fechaLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Rango consultado: fechaDesde/fechaHasta, o un solo día con `fecha`. Por defecto, hoy.
  private resolverRango(query: DiaHojaRutaQueryDto): { desde: string; hasta: string } {
    const desde = (query.fechaDesde ?? query.fecha ?? query.fechaHasta ?? this.hoy()).slice(0, 10);
    const hasta = (query.fechaHasta ?? query.fecha ?? desde).slice(0, 10);
    if (desde > hasta) throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    const dias = (Date.parse(hasta) - Date.parse(desde)) / 86400000 + 1;
    if (dias > MAX_DIAS_RANGO) {
      throw new BadRequestException(`El rango no puede superar los ${MAX_DIAS_RANGO} días`);
    }
    return { desde, hasta };
  }

  // Pedidos (turnos con retiro confirmado) asignados a transportistas en el rango de fechas
  private turnosEnRango(desde: string, hasta: string, empleadoTransportistaId?: number) {
    const qb = this.turnoRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.donante', 'donante')
      .innerJoinAndSelect('t.estadoTurno', 'estado')
      .innerJoinAndSelect('t.empleadoTransportista', 'et')
      .leftJoinAndSelect('et.empleado', 'emp')
      .leftJoinAndSelect('et.vehiculo', 'veh')
      .where('t.isActive = 1')
      .andWhere('LOWER(estado.descripcion) = :estado', { estado: ESTADO_TURNO_RETIRO_CONFIRMADO })
      .andWhere('DATE(t.fechaHora) BETWEEN :desde AND :hasta', { desde, hasta })
      .orderBy('t.fechaHora', 'ASC')
      .addOrderBy('t.id', 'ASC');
    if (empleadoTransportistaId) qb.andWhere('t.empleadoTransportistaId = :empleadoTransportistaId', { empleadoTransportistaId });
    return qb.getMany();
  }

  private toHojaInfo(hoja: HojaRuta): NonNullable<HojaRutaDia['hojaRuta']> {
    const kmInicial = hoja.historialKm?.kmInicial ?? null;
    const kmFinal = hoja.historialKm?.kmFinal ?? null;
    return {
      id: hoja.id,
      estado: hoja.estado,
      fechaInicio: hoja.fechaInicio,
      fechaFin: hoja.fechaFin,
      kmInicial,
      kmFinal,
      kmReales: kmInicial !== null && kmFinal !== null ? kmFinal - kmInicial : null,
      kmEstimado: hoja.historialKm?.kmEstimado ?? null,
    };
  }

  /**
   * Hojas de ruta de un rango de fechas: una por transportista y día con pedidos asignados. La del
   * día en curso se crea (estado Pendiente) la primera vez que se consulta y se mantiene
   * sincronizada mientras siga Pendiente; luego solo avanza con iniciar() y finalizar().
   */
  async getDia(query: DiaHojaRutaQueryDto): Promise<HojaRutaDia[]> {
    const { desde, hasta } = this.resolverRango(query);
    const turnos = await this.turnosEnRango(desde, hasta, query.empleadoTransportistaId);

    const hojas = await this.hojaRepository.find({
      where: {
        fecha: Between(desde, hasta),
        isActive: true,
        ...(query.empleadoTransportistaId ? { empleadoTransportistaId: query.empleadoTransportistaId } : {}),
      },
      relations: HOJA_RELATIONS,
    });
    const claveDe = (transportistaId: number, fecha: string) => `${transportistaId}|${fecha}`;
    const hojaPorClave = new Map(hojas.map((h) => [claveDe(h.empleadoTransportistaId, h.fecha), h]));

    // Turnos agrupados por transportista y día (los pedidos ya vienen ordenados por hora)
    const turnosPorClave = new Map<string, { transportistaId: number; fecha: string; lista: Turno[] }>();
    for (const t of turnos) {
      const transportistaId = t.empleadoTransportistaId as number;
      const fecha = this.fechaLocal(t.fechaHora);
      const clave = claveDe(transportistaId, fecha);
      const grupo = turnosPorClave.get(clave) ?? { transportistaId, fecha, lista: [] };
      grupo.lista.push(t);
      turnosPorClave.set(clave, grupo);
    }
    // Una hoja ya creada se muestra aunque sus turnos hayan cambiado después
    for (const h of hojas) {
      const clave = claveDe(h.empleadoTransportistaId, h.fecha);
      if (!turnosPorClave.has(clave)) {
        turnosPorClave.set(clave, { transportistaId: h.empleadoTransportistaId, fecha: h.fecha, lista: [] });
      }
    }

    // Una hoja generada (en proceso o finalizada) conserva todos sus turnos, aunque algunos ya se hayan retirado
    // y hayan dejado de estar "con retiro confirmado"
    const generadas = hojas.filter((h) => h.estado !== ESTADO_HOJA_PENDIENTE);
    if (generadas.length) {
      const filas = await this.dataSource.getRepository(HojaRutaTurno).find({
        where: { hojaRutaId: In(generadas.map((h) => h.id)) },
        relations: ['turno', 'turno.donante', 'turno.estadoTurno', 'turno.empleadoTransportista', 'turno.empleadoTransportista.empleado', 'turno.empleadoTransportista.vehiculo'],
      });
      for (const h of generadas) {
        const lista = filas
          .filter((f) => f.hojaRutaId === h.id && f.turno)
          .map((f) => f.turno)
          .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime() || a.id - b.id);
        turnosPorClave.set(claveDe(h.empleadoTransportistaId, h.fecha), { transportistaId: h.empleadoTransportistaId, fecha: h.fecha, lista });
      }
    }

    // Datos de las donaciones de todos los turnos (dirección alternativa de retiro) y sus constancias
    const todosLosTurnos = [...turnosPorClave.values()].flatMap((g) => g.lista);
    const donacionIds = [...new Set(todosLosTurnos.map((t) => t.donacionId).filter((id): id is number => id !== null))];
    const donaciones = donacionIds.length ? await this.donacionRepository.find({ where: { id: In(donacionIds) } }) : [];
    const donacionPorId = new Map(donaciones.map((d) => [d.id, d]));
    const retiros = donacionIds.length
      ? await this.dataSource.getRepository(Retiro).find({ where: { donacionId: In(donacionIds), isActive: true } })
      : [];
    const constancias = retiros.length
      ? await this.dataSource.getRepository(ConstanciaRetiro).find({ where: { retiroId: In(retiros.map((r) => r.id)), isActive: true } })
      : [];
    const retiroPorDonacion = new Map(retiros.map((r) => [r.donacionId, r]));
    const constanciaPorRetiro = new Map(constancias.map((c) => [c.retiroId, c.id]));

    const grupos: HojaRutaDia[] = [];
    for (const [clave, { transportistaId, fecha, lista }] of turnosPorClave) {
      let hoja = hojaPorClave.get(clave) ?? null;
      const et = lista[0]?.empleadoTransportista ?? hoja?.empleadoTransportista ?? null;
      if (!et) continue;

      const base = lista.map((t) => {
        const donacion = t.donacionId ? donacionPorId.get(t.donacionId) : undefined;
        const direccion = (donacion?.direccionRetiro || t.donante?.direccion || '').trim();
        return {
          turnoId: t.id,
          donante: t.donante?.nombre ?? `Donante #${t.donanteId}`,
          direccion,
          fechaHora: t.fechaHora,
          estadoTurno: t.estadoTurno?.descripcion ?? '',
          retirado: (t.estadoTurno?.descripcion ?? '').toLowerCase() !== ESTADO_TURNO_RETIRO_CONFIRMADO,
          constanciaId: t.donacionId ? (constanciaPorRetiro.get(retiroPorDonacion.get(t.donacionId)?.id ?? -1) ?? null) : null,
        };
      });

      // Una hoja finalizada ya no se recalcula: se conserva lo estimado al momento de crearse
      const finalizada = hoja?.estado === ESTADO_HOJA_FINALIZADA;
      const ruta = finalizada
        ? { orden: base.map((_, i) => i), kmEstimados: hoja!.kmEstimados, mapsUrl: null, embedUrl: null, origen: null, puntos: [], optimizada: false, advertencia: undefined }
        : await this.mapsService.calcular(base.map((b) => b.direccion));

      const paradas: ParadaHojaRuta[] = ruta.orden.map((idx, pos) => ({
        ...base[idx],
        orden: pos + 1,
        sinDireccion: !base[idx].direccion,
      }));

      const recorrido: PuntoRecorrido[] = ruta.puntos.map((p) => {
        const orden = p.indice !== null ? ruta.orden.indexOf(p.indice) + 1 : null;
        const etiqueta =
          p.indice === null
            ? p.rol === 'origen' ? 'Origen (base)' : 'Destino (regreso a la base)'
            : p.rol === 'origen' ? `Origen (parada ${orden})`
            : p.rol === 'destino' ? `Destino (parada ${orden})`
            : `Parada ${orden}`;
        return { rol: p.rol, etiqueta, direccion: p.direccion, donante: p.indice !== null ? base[p.indice].donante : null };
      });

      const vehiculo = hoja?.vehiculo ?? et.vehiculo ?? null;

      if (hoja && hoja.estado === ESTADO_HOJA_PENDIENTE && (hoja.cantidadPedidos !== paradas.length || hoja.kmEstimados !== ruta.kmEstimados)) {
        await this.hojaRepository.update(hoja.id, { cantidadPedidos: paradas.length, kmEstimados: ruta.kmEstimados });
        hoja.cantidadPedidos = paradas.length;
        hoja.kmEstimados = ruta.kmEstimados;
      }

      const advertencias = [ruta.advertencia, !vehiculo ? 'El transportista no tiene un vehículo asignado' : undefined].filter(Boolean);
      grupos.push({
        empleadoTransportistaId: transportistaId,
        transportista: et.empleado
          ? { nombre: et.empleado.nombre, apellido: et.empleado.apellido, cuitDni: et.empleado.cuitDni ?? null }
          : null,
        vehiculo: vehiculo
          ? { id: vehiculo.id, patente: vehiculo.patente, marca: vehiculo.marca, modelo: vehiculo.modelo, kilometraje: vehiculo.kilometraje ?? null }
          : null,
        fecha,
        estado: hoja?.estado ?? ESTADO_HOJA_PENDIENTE,
        paradas,
        cantidadPedidos: hoja?.cantidadPedidos ?? paradas.length,
        // generada: los km estimados quedan fijos como al generarla; sin generar, se calculan con los pedidos actuales
        kmEstimados: hoja && hoja.estado !== ESTADO_HOJA_PENDIENTE ? hoja.kmEstimados : ruta.kmEstimados,
        mapsUrl: ruta.mapsUrl,
        embedUrl: ruta.embedUrl,
        recorrido,
        origen: ruta.origen,
        rutaOptimizada: ruta.optimizada,
        advertencia: advertencias.length ? advertencias.join('. ') : undefined,
        hojaRuta: hoja ? this.toHojaInfo(hoja) : null,
      });
    }

    // Días más recientes primero; dentro de cada día, por transportista
    return grupos
      .filter((g) => !query.estado || g.estado === query.estado)
      .sort(
        (a, b) =>
          b.fecha.localeCompare(a.fecha) ||
          `${a.transportista?.apellido ?? ''} ${a.transportista?.nombre ?? ''}`.localeCompare(
            `${b.transportista?.apellido ?? ''} ${b.transportista?.nombre ?? ''}`,
          ),
      );
  }

  private async getGrupo(fecha: string, empleadoTransportistaId: number): Promise<HojaRutaDia> {
    const [grupo] = await this.getDia({ fechaDesde: fecha, fechaHasta: fecha, empleadoTransportistaId });
    if (!grupo) throw new NotFoundException('No se encontró la hoja de ruta');
    return grupo;
  }

  /** Hojas "en proceso" del transportista (distintas de `excluirId`) que todavía tienen turnos pendientes de retiro. */
  private async hojasIniciadasConPendientes(empleadoTransportistaId: number, excluirId?: number) {
    const hojas = await this.hojaRepository.find({
      where: { empleadoTransportistaId, estado: ESTADO_HOJA_EN_PROCESO, isActive: true, ...(excluirId ? { id: Not(excluirId) } : {}) },
    });
    const resultado: { id: number; fecha: string; pendientes: number }[] = [];
    for (const h of hojas) {
      const filas = await this.dataSource.getRepository(HojaRutaTurno).find({ where: { hojaRutaId: h.id }, relations: ['turno', 'turno.estadoTurno'] });
      const pendientes = filas.filter((f) => (f.turno?.estadoTurno?.descripcion ?? '').toLowerCase() === ESTADO_TURNO_RETIRO_CONFIRMADO).length;
      if (pendientes > 0) resultado.push({ id: h.id, fecha: h.fecha, pendientes });
    }
    return resultado;
  }

  /**
   * Genera la hoja de ruta de una fecha con los turnos pendientes de retiro del transportista: la deja "En proceso",
   * registra en el historial de km del vehículo (km inicial = km final del último registro, o el km del vehículo
   * si no hay ninguno, y los km estimados del recorrido) y guarda los turnos incluidos.
   * Si el transportista tiene otra hoja iniciada con turnos pendientes, avisa (409) y espera confirmación.
   */
  async generar(empleadoTransportistaId: number, fechaPedida?: string, confirmar = false): Promise<HojaRutaDia> {
    const fecha = (fechaPedida ?? this.hoy()).slice(0, 10);
    const grupo = (await this.getDia({ fechaDesde: fecha, fechaHasta: fecha, empleadoTransportistaId }))[0];
    if (!grupo || grupo.paradas.length === 0) {
      throw new BadRequestException('No hay turnos pendientes de retiro para esa fecha: no hay hoja de ruta para generar');
    }
    if (grupo.hojaRuta && grupo.hojaRuta.estado === ESTADO_HOJA_EN_PROCESO) return grupo; // ya generada
    if (grupo.hojaRuta && grupo.hojaRuta.estado === ESTADO_HOJA_FINALIZADA) {
      throw new ConflictException('La hoja de ruta de esa fecha ya fue finalizada');
    }
    if (!grupo.vehiculo) {
      throw new BadRequestException('El transportista no tiene un vehículo asignado: no se puede generar la hoja de ruta');
    }

    if (!confirmar) {
      const otras = await this.hojasIniciadasConPendientes(empleadoTransportistaId);
      if (otras.length) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            code: 'HOJA_INICIADA_PENDIENTE',
            message: 'Tenés otra hoja de ruta iniciada con turnos pendientes de retiro.',
            hojas: otras,
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    const vehiculo = await this.vehiculoRepository.findOne({ where: { id: grupo.vehiculo.id } });
    if (!vehiculo) throw new NotFoundException('El vehículo del transportista no existe');
    // km inicial: el km final del último registro del vehículo; sin registros previos, el km actual del vehículo
    const ultimo = await this.dataSource.getRepository(HistorialKmVehiculo).findOne({
      where: { vehiculoId: vehiculo.id, kmFinal: Not(IsNull()) },
      order: { id: 'DESC' },
    });
    const kmInicial = ultimo?.kmFinal ?? vehiculo.kilometraje;
    if (kmInicial === null || kmInicial === undefined) {
      throw new BadRequestException(
        `El vehículo ${vehiculo.patente} no tiene kilometraje cargado. Completalo en Vehículos antes de generar la hoja de ruta`,
      );
    }

    await this.dataSource.transaction(async (m) => {
      const historial = await m.save(
        m.create(HistorialKmVehiculo, { vehiculoId: vehiculo.id, kmInicial, kmEstimado: grupo.kmEstimados }),
      );
      const datos = {
        vehiculoId: vehiculo.id,
        estado: ESTADO_HOJA_EN_PROCESO,
        fechaInicio: new Date(),
        cantidadPedidos: grupo.paradas.length,
        kmEstimados: grupo.kmEstimados,
        historialKmId: historial.id,
      };
      let hojaId = grupo.hojaRuta?.id;
      if (hojaId) {
        // hoja Pendiente que ya existía: la condición sobre el estado evita generarla dos veces
        const res = await m.update(HojaRuta, { id: hojaId, estado: ESTADO_HOJA_PENDIENTE }, datos);
        if (!res.affected) throw new ConflictException('La hoja de ruta ya fue generada');
      } else {
        hojaId = (await m.save(m.create(HojaRuta, { empleadoTransportistaId, fecha, ...datos }))).id;
      }
      await m.save(grupo.paradas.map((p) => m.create(HojaRutaTurno, { hojaRutaId: hojaId as number, turnoId: p.turnoId })));
    });

    return this.getGrupo(fecha, empleadoTransportistaId);
  }

  /**
   * Confirma el retiro de un turno de una hoja en proceso (equivale a finalizar el turno: pasa a clasificación,
   * se registra el retiro y los materiales) y genera la constancia de retiro. Al confirmar el último turno
   * pendiente, la hoja se finaliza sola: km final = km inicial + km estimados, que también pasa a ser el km del vehículo.
   */
  async confirmarRetiro(turnoId: number): Promise<{ turnoId: number; constanciaId: number | null; hojaFinalizada: boolean }> {
    const fila = await this.dataSource.getRepository(HojaRutaTurno).findOne({
      where: { turnoId },
      relations: ['hojaRuta', 'hojaRuta.historialKm', 'turno', 'turno.estadoTurno', 'turno.empleadoTransportista'],
      order: { id: 'DESC' },
    });
    if (!fila || fila.hojaRuta.estado !== ESTADO_HOJA_EN_PROCESO) {
      throw new BadRequestException('El turno no pertenece a una hoja de ruta iniciada: generá la hoja de ruta primero');
    }
    if ((fila.turno.estadoTurno?.descripcion ?? '').toLowerCase() !== ESTADO_TURNO_RETIRO_CONFIRMADO) {
      throw new ConflictException('El retiro de este turno ya fue confirmado');
    }

    // Valida la foto y registra el retiro y los materiales (no escribe nada si falta algo)
    await this.turnoService.finalizarTurno(turnoId);

    const transportista = fila.turno.empleadoTransportista;
    return this.dataSource.transaction(async (m) => {
      let constanciaId: number | null = null;
      const retiro = fila.turno.donacionId
        ? await m.getRepository(Retiro).findOne({ where: { donacionId: fila.turno.donacionId, isActive: true } })
        : null;
      if (retiro) {
        const ahora = new Date();
        const existente = await m.getRepository(ConstanciaRetiro).findOne({ where: { retiroId: retiro.id, isActive: true } });
        constanciaId = existente
          ? existente.id
          : (
              await m.save(
                m.create(ConstanciaRetiro, {
                  retiroId: retiro.id,
                  fechaEmision: ahora,
                  // La constancia la genera el transportista al retirar
                  tecnicoId: transportista?.empleadoId,
                }),
              )
            ).id;
        await m.update(Retiro, retiro.id, { fechaRetiro: ahora });
      }

      // ¿Quedan turnos pendientes en la hoja? Si no, se finaliza con los km estimados
      const filas = await m.getRepository(HojaRutaTurno).find({ where: { hojaRutaId: fila.hojaRutaId }, relations: ['turno', 'turno.estadoTurno'] });
      const quedan = filas.some((f) => (f.turno?.estadoTurno?.descripcion ?? '').toLowerCase() === ESTADO_TURNO_RETIRO_CONFIRMADO);
      if (quedan) return { turnoId, constanciaId, hojaFinalizada: false };

      const historial = fila.hojaRuta.historialKm;
      const kmInicial = historial?.kmInicial ?? 0;
      const kmEstimado = Number(historial?.kmEstimado ?? fila.hojaRuta.kmEstimados ?? 0);
      const kmFinal = Math.round(kmInicial + kmEstimado);
      const res = await m.update(HojaRuta, { id: fila.hojaRutaId, estado: ESTADO_HOJA_EN_PROCESO }, { estado: ESTADO_HOJA_FINALIZADA, fechaFin: new Date() });
      if (res.affected) {
        if (historial) await m.update(HistorialKmVehiculo, { id: historial.id }, { kmFinal });
        await m.update(Vehiculo, { id: fila.hojaRuta.vehiculoId }, { kilometraje: kmFinal });
      }
      return { turnoId, constanciaId, hojaFinalizada: !!res.affected };
    });
  }

  /** Datos de la constancia de retiro de un turno, para mostrarla y descargarla en PDF. */
  async constanciaDeTurno(turnoId: number) {
    const turno = await this.turnoService.findOne(turnoId);
    const retiro = turno.donacionId
      ? await this.dataSource.getRepository(Retiro).findOne({
          where: { donacionId: turno.donacionId, isActive: true },
          relations: ['vehiculo', 'empleadoTransportista', 'empleadoTransportista.empleado'],
        })
      : null;
    const constancia = retiro
      ? await this.dataSource.getRepository(ConstanciaRetiro).findOne({ where: { retiroId: retiro.id, isActive: true }, relations: ['tecnico'] })
      : null;
    if (!retiro || !constancia) throw new NotFoundException('Este turno todavía no tiene constancia de retiro: confirmá el retiro primero');
    const donacion = turno.donacionId ? await this.donacionRepository.findOne({ where: { id: turno.donacionId } }) : null;
    const emp = retiro.empleadoTransportista?.empleado;
    return {
      constanciaId: constancia.id,
      turnoId: turno.id,
      donacionId: turno.donacionId,
      fechaEmision: constancia.fechaEmision,
      fechaRetiro: retiro.fechaRetiro,
      observaciones: constancia.observaciones ?? null,
      donante: { nombre: turno.donante?.nombre ?? '', telefono: turno.donante?.telefono ?? null },
      direccion: retiro.direccion ?? donacion?.direccionRetiro ?? turno.donante?.direccion ?? null,
      transportista: emp ? { nombre: emp.nombre, apellido: emp.apellido, cuitDni: emp.cuitDni ?? null } : null,
      vehiculo: retiro.vehiculo ? { patente: retiro.vehiculo.patente, marca: retiro.vehiculo.marca, modelo: retiro.vehiculo.modelo } : null,
      pesoEstimadoKg: donacion?.pesoEstimadoKg ?? null,
      materiales: (turno.detalles ?? []).map((d) => ({ tipo: d.tipoMaterial?.nombre ?? `Material #${d.tipoMaterialId}`, cantidad: d.cantidadConfirmada ?? null })),
    };
  }

  // Hojas de ruta finalizadas, con km estimados (Maps) y reales (km_final - km_inicial)
  async historico(query: HistoricoHojaRutaQueryDto): Promise<HojaRutaHistorico[]> {
    const desde = query.fechaDesde?.slice(0, 10);
    const hasta = query.fechaHasta?.slice(0, 10);
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    }

    const qb = this.hojaRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.empleadoTransportista', 'et')
      .leftJoinAndSelect('et.empleado', 'emp')
      .leftJoinAndSelect('h.vehiculo', 'veh')
      .leftJoinAndSelect('h.historialKm', 'hk')
      .where('h.isActive = 1')
      .andWhere('h.estado = :estado', { estado: ESTADO_HOJA_FINALIZADA })
      .orderBy('h.fecha', 'DESC')
      .addOrderBy('h.id', 'DESC');
    if (desde) qb.andWhere('h.fecha >= :desde', { desde });
    if (hasta) qb.andWhere('h.fecha <= :hasta', { hasta });
    if (query.empleadoTransportistaId) qb.andWhere('h.empleadoTransportistaId = :et', { et: query.empleadoTransportistaId });
    if (query.vehiculoId) qb.andWhere('h.vehiculoId = :veh', { veh: query.vehiculoId });

    const hojas = await qb.getMany();
    return hojas.map((h) => {
      const kmInicial = h.historialKm?.kmInicial ?? null;
      const kmFinal = h.historialKm?.kmFinal ?? null;
      const emp = h.empleadoTransportista?.empleado;
      return {
        id: h.id,
        fecha: h.fecha,
        empleadoTransportistaId: h.empleadoTransportistaId,
        transportista: emp ? `${emp.nombre} ${emp.apellido}` : `Transportista #${h.empleadoTransportistaId}`,
        vehiculo: h.vehiculo
          ? { id: h.vehiculo.id, patente: h.vehiculo.patente, marca: h.vehiculo.marca, modelo: h.vehiculo.modelo }
          : null,
        cantidadPedidos: h.cantidadPedidos,
        kmEstimados: h.kmEstimados,
        kmInicial,
        kmFinal,
        kmReales: kmInicial !== null && kmFinal !== null ? kmFinal - kmInicial : null,
        fechaInicio: h.fechaInicio,
        fechaFin: h.fechaFin,
        estado: h.estado,
      };
    });
  }
}
