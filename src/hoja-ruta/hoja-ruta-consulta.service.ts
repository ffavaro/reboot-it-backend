import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { Donacion } from '../donacion/donacion.entity';
import { HistorialKmVehiculo } from '../historial-km-vehiculo/entities/historial-km-vehiculo.entity';
import { Retiro } from '../retiro/retiro.entity';
import { Turno } from '../turno/turno.entity';
import { ConsultaHojaRutaDto, HistoricoHojaRutaDto } from './dto/hoja-ruta.dto';
import {
  aFechaLocal,
  ESTADO_HOJA,
  ESTADOS_TURNO_POR_RETIRAR,
  hoy,
  MAX_DIAS_CONSULTA,
  quedaPorRetirar,
} from '../utils/helpers';
import { HojaRutaTurno } from './entities/hoja-ruta-turno.entity';
import { HojaRuta } from './entities/hoja-ruta.entity';
import {
  HojaRutaDia,
  HojaRutaHistorico,
  ParadaHojaRuta,
  PuntoRecorrido,
  ResumenHoja,
} from '../interfaces/hoja-ruta.types';
import { RutaService } from './rutas/ruta.service';
import { PuntoRuta, RutaCalculada } from '../interfaces/ruta.types';

const RELACIONES_HOJA = [
  'empleadoTransportista',
  'empleadoTransportista.empleado',
  'vehiculo',
  'historialKm',
];
const RELACIONES_TURNO_GUARDADO = [
  'turno',
  'turno.donante',
  'turno.estadoTurno',
  'turno.empleadoTransportista',
  'turno.empleadoTransportista.empleado',
  'turno.empleadoTransportista.vehiculo',
];

interface Grupo {
  transportistaId: number;
  fecha: string;
  turnos: Turno[];
}

interface DatosRetiro {
  direccionDe(turno: Turno): string;
  constanciaDe(turno: Turno): number | null;
}

type ParadaBase = Omit<ParadaHojaRuta, 'orden' | 'sinDireccion'>;

const claveDe = (transportistaId: number, fecha: string) =>
  `${transportistaId}|${fecha}`;

export function kmRecorridos(historial?: HistorialKmVehiculo | null) {
  const kmInicial = historial?.kmInicial ?? null;
  const kmFinal = historial?.kmFinal ?? null;
  return {
    kmInicial,
    kmFinal,
    kmReales:
      kmInicial !== null && kmFinal !== null ? kmFinal - kmInicial : null,
  };
}

@Injectable()
export class HojaRutaConsultaService {
  constructor(
    @InjectRepository(HojaRuta)
    private readonly hojaRepository: Repository<HojaRuta>,
    @InjectRepository(HojaRutaTurno)
    private readonly hojaTurnoRepository: Repository<HojaRutaTurno>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
    @InjectRepository(ConstanciaRetiro)
    private readonly constanciaRepository: Repository<ConstanciaRetiro>,
    private readonly rutaService: RutaService,
  ) {}

  async consultar(query: ConsultaHojaRutaDto): Promise<HojaRutaDia[]> {
    const { desde, hasta } = this.rango(query);
    const transportistaId = query.empleadoTransportistaId;

    const [turnos, hojas] = await Promise.all([
      this.turnosPorRetirar(desde, hasta, transportistaId),
      this.hojaRepository.find({
        where: {
          fecha: Between(desde, hasta),
          isActive: true,
          ...(transportistaId && { empleadoTransportistaId: transportistaId }),
        },
        relations: RELACIONES_HOJA,
      }),
    ]);

    const grupos = this.agrupar(turnos, hojas);
    await this.usarTurnosGuardados(grupos, hojas);

    const hojaPorClave = new Map(
      hojas.map((h) => [claveDe(h.empleadoTransportistaId, h.fecha), h]),
    );
    const retiros = await this.datosDeRetiro(
      [...grupos.values()].flatMap((g) => g.turnos),
    );

    const dias: HojaRutaDia[] = [];
    for (const [clave, grupo] of grupos) {
      const dia = await this.armarDia(
        grupo,
        hojaPorClave.get(clave) ?? null,
        retiros,
      );
      if (dia) dias.push(dia);
    }

    return dias
      .filter((d) => !query.estado || d.estado === query.estado)
      .sort((a, b) => this.porFechaYTransportista(a, b));
  }

  async delDia(
    fecha: string,
    empleadoTransportistaId: number,
  ): Promise<HojaRutaDia | undefined> {
    const [dia] = await this.consultar({
      fechaDesde: fecha,
      fechaHasta: fecha,
      empleadoTransportistaId,
    });
    return dia;
  }

  async delDiaOFallar(
    fecha: string,
    empleadoTransportistaId: number,
  ): Promise<HojaRutaDia> {
    const dia = await this.delDia(fecha, empleadoTransportistaId);
    if (!dia) throw new NotFoundException('No se encontró la hoja de ruta');
    return dia;
  }

  async historico(query: HistoricoHojaRutaDto): Promise<HojaRutaHistorico[]> {
    const desde = query.fechaDesde?.slice(0, 10);
    const hasta = query.fechaHasta?.slice(0, 10);
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException(
        'La fecha desde no puede ser posterior a la fecha hasta',
      );
    }

    const qb = this.hojaRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.empleadoTransportista', 'et')
      .leftJoinAndSelect('et.empleado', 'emp')
      .leftJoinAndSelect('h.vehiculo', 'veh')
      .leftJoinAndSelect('h.historialKm', 'hk')
      .where('h.isActive = 1')
      .andWhere('h.estado = :estado', { estado: ESTADO_HOJA.FINALIZADA })
      .orderBy('h.fechaFin', 'DESC')
      .addOrderBy('h.id', 'DESC');

    if (desde)
      qb.andWhere('COALESCE(DATE(h.fechaFin), h.fecha) >= :desde', { desde });
    if (hasta)
      qb.andWhere('COALESCE(DATE(h.fechaFin), h.fecha) <= :hasta', { hasta });
    if (query.empleadoTransportistaId)
      qb.andWhere('h.empleadoTransportistaId = :et', {
        et: query.empleadoTransportistaId,
      });
    if (query.vehiculoId)
      qb.andWhere('h.vehiculoId = :veh', { veh: query.vehiculoId });

    const hojas = await qb.getMany();
    return hojas.map((h) => {
      const empleado = h.empleadoTransportista?.empleado;
      return {
        id: h.id,
        fecha: h.fecha,
        empleadoTransportistaId: h.empleadoTransportistaId,
        transportista: empleado
          ? `${empleado.nombre} ${empleado.apellido}`
          : `Transportista #${h.empleadoTransportistaId}`,
        vehiculo: h.vehiculo
          ? {
              id: h.vehiculo.id,
              patente: h.vehiculo.patente,
              marca: h.vehiculo.marca,
              modelo: h.vehiculo.modelo,
            }
          : null,
        cantidadPedidos: h.cantidadPedidos,
        kmEstimados: h.kmEstimados,
        ...kmRecorridos(h.historialKm),
        fechaInicio: h.fechaInicio,
        fechaFin: h.fechaFin,
        estado: h.estado,
      };
    });
  }

  private rango(query: ConsultaHojaRutaDto) {
    const desde = (
      query.fechaDesde ??
      query.fecha ??
      query.fechaHasta ??
      hoy()
    ).slice(0, 10);
    const hasta = (query.fechaHasta ?? query.fecha ?? desde).slice(0, 10);
    if (desde > hasta) {
      throw new BadRequestException(
        'La fecha desde no puede ser posterior a la fecha hasta',
      );
    }
    const dias = (Date.parse(hasta) - Date.parse(desde)) / 86_400_000 + 1;
    if (dias > MAX_DIAS_CONSULTA) {
      throw new BadRequestException(
        `El rango no puede superar los ${MAX_DIAS_CONSULTA} días`,
      );
    }
    return { desde, hasta };
  }

  private turnosPorRetirar(
    desde: string,
    hasta: string,
    transportistaId?: number,
  ) {
    const qb = this.turnoRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.donante', 'donante')
      .innerJoinAndSelect('t.estadoTurno', 'estado')
      .innerJoinAndSelect('t.empleadoTransportista', 'et')
      .leftJoinAndSelect('et.empleado', 'emp')
      .leftJoinAndSelect('et.vehiculo', 'veh')
      .where('t.isActive = 1')
      .andWhere('LOWER(estado.descripcion) IN (:...estados)', {
        estados: ESTADOS_TURNO_POR_RETIRAR,
      })
      .andWhere('DATE(t.fechaHora) BETWEEN :desde AND :hasta', { desde, hasta })
      .orderBy('t.fechaHora', 'ASC')
      .addOrderBy('t.id', 'ASC');

    if (transportistaId)
      qb.andWhere('t.empleadoTransportistaId = :transportistaId', {
        transportistaId,
      });
    return qb.getMany();
  }

  private agrupar(turnos: Turno[], hojas: HojaRuta[]): Map<string, Grupo> {
    const grupos = new Map<string, Grupo>();

    for (const turno of turnos) {
      const transportistaId = turno.empleadoTransportistaId as number;
      const fecha = aFechaLocal(new Date(turno.fechaHora));
      const clave = claveDe(transportistaId, fecha);
      if (!grupos.has(clave))
        grupos.set(clave, { transportistaId, fecha, turnos: [] });
      grupos.get(clave)!.turnos.push(turno);
    }

    for (const hoja of hojas) {
      const clave = claveDe(hoja.empleadoTransportistaId, hoja.fecha);
      if (!grupos.has(clave))
        grupos.set(clave, {
          transportistaId: hoja.empleadoTransportistaId,
          fecha: hoja.fecha,
          turnos: [],
        });
    }

    return grupos;
  }

  private async usarTurnosGuardados(
    grupos: Map<string, Grupo>,
    hojas: HojaRuta[],
  ) {
    const generadas = hojas.filter((h) => h.estado !== ESTADO_HOJA.PENDIENTE);
    if (!generadas.length) return;

    const filas = await this.hojaTurnoRepository.find({
      where: { hojaRutaId: In(generadas.map((h) => h.id)) },
      relations: RELACIONES_TURNO_GUARDADO,
    });

    for (const hoja of generadas) {
      const turnos = filas
        .filter((f) => f.hojaRutaId === hoja.id && f.turno)
        .map((f) => f.turno)
        .sort(
          (a, b) =>
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime() ||
            a.id - b.id,
        );
      grupos.set(claveDe(hoja.empleadoTransportistaId, hoja.fecha), {
        transportistaId: hoja.empleadoTransportistaId,
        fecha: hoja.fecha,
        turnos,
      });
    }
  }

  private async datosDeRetiro(turnos: Turno[]): Promise<DatosRetiro> {
    const donacionIds = [
      ...new Set(
        turnos
          .map((t) => t.donacionId)
          .filter((id): id is number => id !== null),
      ),
    ];

    const [donaciones, retiros] = donacionIds.length
      ? await Promise.all([
          this.donacionRepository.find({ where: { id: In(donacionIds) } }),
          this.retiroRepository.find({
            where: { donacionId: In(donacionIds), isActive: true },
          }),
        ])
      : [[], []];

    const constancias = retiros.length
      ? await this.constanciaRepository.find({
          where: { retiroId: In(retiros.map((r) => r.id)), isActive: true },
        })
      : [];

    const donacionPorId = new Map(donaciones.map((d) => [d.id, d]));
    const retiroPorDonacion = new Map(retiros.map((r) => [r.donacionId, r.id]));
    const constanciaPorRetiro = new Map(
      constancias.map((c) => [c.retiroId, c.id]),
    );

    return {
      direccionDe: (turno) => {
        const donacion = turno.donacionId
          ? donacionPorId.get(turno.donacionId)
          : undefined;
        return (
          donacion?.direccionRetiro ||
          turno.donante?.direccion ||
          ''
        ).trim();
      },
      constanciaDe: (turno) => {
        const retiroId = turno.donacionId
          ? retiroPorDonacion.get(turno.donacionId)
          : undefined;
        return retiroId ? (constanciaPorRetiro.get(retiroId) ?? null) : null;
      },
    };
  }

  private async armarDia(
    grupo: Grupo,
    hoja: HojaRuta | null,
    retiros: DatosRetiro,
  ): Promise<HojaRutaDia | null> {
    const transportista =
      grupo.turnos[0]?.empleadoTransportista ??
      hoja?.empleadoTransportista ??
      null;
    if (!transportista) return null;

    const base: ParadaBase[] = grupo.turnos.map((turno) => ({
      turnoId: turno.id,
      donante: turno.donante?.nombre ?? `Donante #${turno.donanteId}`,
      direccion: retiros.direccionDe(turno),
      fechaHora: turno.fechaHora,
      estadoTurno: turno.estadoTurno?.descripcion ?? '',
      retirado: !quedaPorRetirar(turno.estadoTurno?.descripcion),
      constanciaId: retiros.constanciaDe(turno),
    }));

    const finalizada = hoja?.estado === ESTADO_HOJA.FINALIZADA;
    const ruta = finalizada
      ? this.rutaCongelada(base.length, hoja.kmEstimados)
      : await this.rutaService.calcular(base.map((b) => b.direccion));

    const paradas: ParadaHojaRuta[] = ruta.orden.map((indice, pos) => ({
      ...base[indice],
      orden: pos + 1,
      sinDireccion: !base[indice].direccion,
    }));

    if (hoja)
      await this.sincronizarPendiente(hoja, paradas.length, ruta.kmEstimados);

    const vehiculo = hoja?.vehiculo ?? transportista.vehiculo ?? null;
    const empleado = transportista.empleado;
    const advertencias = [
      ruta.advertencia,
      vehiculo ? undefined : 'El transportista no tiene un vehículo asignado',
    ].filter(Boolean);
    const generada = !!hoja && hoja.estado !== ESTADO_HOJA.PENDIENTE;

    return {
      empleadoTransportistaId: grupo.transportistaId,
      transportista: empleado
        ? { nombre: empleado.nombre, apellido: empleado.apellido }
        : null,
      vehiculo: vehiculo
        ? {
            id: vehiculo.id,
            patente: vehiculo.patente,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            kilometraje: vehiculo.kilometraje ?? null,
          }
        : null,
      fecha: grupo.fecha,
      estado: hoja?.estado ?? ESTADO_HOJA.PENDIENTE,
      paradas,
      cantidadPedidos: hoja?.cantidadPedidos ?? paradas.length,
      kmEstimados: generada ? hoja.kmEstimados : ruta.kmEstimados,
      duracionMinutos: ruta.duracionMinutos,
      mapsUrl: ruta.mapsUrl,
      embedUrl: ruta.embedUrl,
      mapa: ruta.mapa,
      recorrido: ruta.puntos.map((p) =>
        this.puntoRecorrido(p, ruta.orden, base),
      ),
      origen: ruta.origen,
      rutaOptimizada: ruta.optimizada,
      advertencia: advertencias.length ? advertencias.join('. ') : undefined,
      hojaRuta: hoja ? this.resumen(hoja) : null,
    };
  }

  private rutaCongelada(
    cantidad: number,
    kmEstimados: number | null,
  ): RutaCalculada {
    return {
      orden: Array.from({ length: cantidad }, (_, i) => i),
      kmEstimados,
      duracionMinutos: null,
      mapsUrl: null,
      embedUrl: null,
      mapa: null,
      origen: null,
      puntos: [],
      optimizada: false,
    };
  }

  private async sincronizarPendiente(
    hoja: HojaRuta,
    cantidad: number,
    kmEstimados: number | null,
  ) {
    if (hoja.estado !== ESTADO_HOJA.PENDIENTE) return;
    if (hoja.cantidadPedidos === cantidad && hoja.kmEstimados === kmEstimados)
      return;
    await this.hojaRepository.update(hoja.id, {
      cantidadPedidos: cantidad,
      kmEstimados,
    });
    hoja.cantidadPedidos = cantidad;
    hoja.kmEstimados = kmEstimados;
  }

  private puntoRecorrido(
    punto: PuntoRuta,
    orden: number[],
    base: ParadaBase[],
  ): PuntoRecorrido {
    if (punto.indice === null) {
      return {
        rol: punto.rol,
        etiqueta:
          punto.rol === 'origen'
            ? 'Origen (base)'
            : 'Destino (regreso a la base)',
        direccion: punto.direccion,
        donante: null,
      };
    }

    const numero = orden.indexOf(punto.indice) + 1;
    const etiquetas = {
      origen: `Origen (parada ${numero})`,
      destino: `Destino (parada ${numero})`,
      parada: `Parada ${numero}`,
    };
    return {
      rol: punto.rol,
      etiqueta: etiquetas[punto.rol],
      direccion: punto.direccion,
      donante: base[punto.indice].donante,
    };
  }

  private resumen(hoja: HojaRuta): ResumenHoja {
    return {
      id: hoja.id,
      estado: hoja.estado,
      fechaInicio: hoja.fechaInicio,
      fechaFin: hoja.fechaFin,
      ...kmRecorridos(hoja.historialKm),
      kmEstimado: hoja.historialKm?.kmEstimado ?? null,
    };
  }

  private porFechaYTransportista(a: HojaRutaDia, b: HojaRutaDia): number {
    const nombre = (d: HojaRutaDia) =>
      `${d.transportista?.apellido ?? ''} ${d.transportista?.nombre ?? ''}`;
    return b.fecha.localeCompare(a.fecha) || nombre(a).localeCompare(nombre(b));
  }
}
