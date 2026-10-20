import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
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
import { DiaHojaRutaQueryDto, FinalizarHojaRutaDto, HistoricoHojaRutaQueryDto } from './dto/hoja-ruta.dto';
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

    const donacionIds = [...new Set(turnos.map((t) => t.donacionId).filter((id): id is number => id !== null))];
    const donaciones = donacionIds.length ? await this.donacionRepository.find({ where: { id: In(donacionIds) } }) : [];
    const donacionPorId = new Map(donaciones.map((d) => [d.id, d]));

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

      if (!hoja && fecha === this.hoy() && paradas.length > 0 && vehiculo) {
        hoja = await this.crearPendiente(transportistaId, vehiculo.id, fecha, paradas.length, ruta.kmEstimados);
      } else if (hoja && hoja.estado === ESTADO_HOJA_PENDIENTE && (hoja.cantidadPedidos !== paradas.length || hoja.kmEstimados !== ruta.kmEstimados)) {
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
        kmEstimados: finalizada ? hoja!.kmEstimados : ruta.kmEstimados,
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

  private async crearPendiente(
    empleadoTransportistaId: number,
    vehiculoId: number,
    fecha: string,
    cantidadPedidos: number,
    kmEstimados: number | null,
  ): Promise<HojaRuta> {
    try {
      const creada = await this.hojaRepository.save(
        this.hojaRepository.create({
          empleadoTransportistaId, vehiculoId, fecha, cantidadPedidos, kmEstimados, estado: ESTADO_HOJA_PENDIENTE,
        }),
      );
      return (await this.hojaRepository.findOne({ where: { id: creada.id }, relations: HOJA_RELATIONS }))!;
    } catch (error) {
      // Dos consultas simultáneas intentaron crearla: se usa la que ganó
      if (error?.code === 'ER_DUP_ENTRY') {
        return (await this.hojaRepository.findOne({ where: { empleadoTransportistaId, fecha }, relations: HOJA_RELATIONS }))!;
      }
      throw error;
    }
  }

  private async getGrupo(fecha: string, empleadoTransportistaId: number): Promise<HojaRutaDia> {
    const [grupo] = await this.getDia({ fechaDesde: fecha, fechaHasta: fecha, empleadoTransportistaId });
    if (!grupo) throw new NotFoundException('No se encontró la hoja de ruta');
    return grupo;
  }

  // Pendiente -> En proceso: el transportista abre la ruta en Google Maps por primera vez
  async iniciar(empleadoTransportistaId: number): Promise<HojaRutaDia> {
    const fecha = this.hoy();
    const grupo = (await this.getDia({ fechaDesde: fecha, fechaHasta: fecha, empleadoTransportistaId }))[0];
    if (!grupo || grupo.paradas.length === 0) {
      throw new BadRequestException('No hay pedidos asignados para hoy: no hay hoja de ruta para iniciar');
    }
    if (!grupo.hojaRuta) {
      throw new BadRequestException('El transportista no tiene un vehículo asignado: no se puede iniciar la hoja de ruta');
    }
    const { id, estado } = grupo.hojaRuta;
    if (estado === ESTADO_HOJA_EN_PROCESO) return grupo; // ya iniciada: no se vuelve a registrar el km inicial
    if (estado === ESTADO_HOJA_FINALIZADA) {
      throw new ConflictException('La hoja de ruta de hoy ya fue finalizada');
    }

    const hoja = await this.hojaRepository.findOneOrFail({ where: { id } });
    const vehiculo = await this.vehiculoRepository.findOne({ where: { id: hoja.vehiculoId } });
    if (!vehiculo) throw new NotFoundException('El vehículo de la hoja de ruta no existe');
    if (vehiculo.kilometraje === null || vehiculo.kilometraje === undefined) {
      throw new BadRequestException(
        `El vehículo ${vehiculo.patente} no tiene kilometraje cargado. Completalo en Vehículos antes de iniciar la hoja de ruta`,
      );
    }

    await this.dataSource.transaction(async (m) => {
      // La condición sobre el estado evita registrar dos veces el km inicial si se presiona dos veces
      const res = await m.update(HojaRuta, { id, estado: ESTADO_HOJA_PENDIENTE }, {
        estado: ESTADO_HOJA_EN_PROCESO,
        fechaInicio: new Date(),
      });
      if (!res.affected) return;
      const historial = await m.save(
        m.create(HistorialKmVehiculo, { vehiculoId: vehiculo.id, kmInicial: vehiculo.kilometraje }),
      );
      await m.update(HojaRuta, { id }, { historialKmId: historial.id });
    });

    return this.getGrupo(fecha, empleadoTransportistaId);
  }

  // En proceso -> Finalizada: se carga el km final del vehículo
  /** Transportista dueño de una hoja de ruta (null si la hoja no existe). */
  async transportistaDe(id: number): Promise<number | null> {
    const hoja = await this.hojaRepository.findOne({ where: { id } });
    return hoja?.empleadoTransportistaId ?? null;
  }

  async finalizar(id: number, dto: FinalizarHojaRutaDto): Promise<HojaRutaDia> {
    const hoja = await this.hojaRepository.findOne({ where: { id, isActive: true }, relations: HOJA_RELATIONS });
    if (!hoja) throw new NotFoundException(`Hoja de ruta ${id} no encontrada`);
    if (hoja.estado === ESTADO_HOJA_FINALIZADA) {
      throw new ConflictException('La hoja de ruta ya fue finalizada y no puede modificarse');
    }
    if (hoja.estado !== ESTADO_HOJA_EN_PROCESO || !hoja.historialKm) {
      throw new BadRequestException('La hoja de ruta todavía no fue iniciada: abrí la ruta en Google Maps primero');
    }
    if (dto.kmFinal < hoja.historialKm.kmInicial) {
      throw new BadRequestException(
        `El kilometraje final (${dto.kmFinal}) no puede ser menor al inicial (${hoja.historialKm.kmInicial})`,
      );
    }

    await this.dataSource.transaction(async (m) => {
      const res = await m.update(HojaRuta, { id, estado: ESTADO_HOJA_EN_PROCESO }, {
        estado: ESTADO_HOJA_FINALIZADA,
        fechaFin: new Date(),
      });
      if (!res.affected) throw new ConflictException('La hoja de ruta ya fue finalizada y no puede modificarse');
      await m.update(HistorialKmVehiculo, { id: hoja.historialKm!.id }, { kmFinal: dto.kmFinal });
      await m.update(Vehiculo, { id: hoja.vehiculoId }, { kilometraje: dto.kmFinal });
    });

    return this.getGrupo(hoja.fecha, hoja.empleadoTransportistaId);
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
