import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { ConstanciaRetiroService } from '../constancia-retiro/constancia-retiro.service';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { HistorialKmVehiculo } from '../historial-km-vehiculo/entities/historial-km-vehiculo.entity';
import { Retiro } from '../retiro/retiro.entity';
import { TurnoService } from '../turno/turno.service';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { ESTADO_HOJA, hoy, quedaPorRetirar } from '../utils/helpers';
import { HojaRutaConsultaService } from './hoja-ruta-consulta.service';
import { HojaRutaTurno } from './entities/hoja-ruta-turno.entity';
import { HojaRuta } from './entities/hoja-ruta.entity';
import { HojaRutaDia } from '../interfaces/hoja-ruta.types';
import { RetiroConfirmado } from '@app/interfaces/ruta.types';

@Injectable()
export class HojaRutaService {
  constructor(
    @InjectRepository(HojaRuta)
    private readonly hojaRepository: Repository<HojaRuta>,
    @InjectRepository(HojaRutaTurno)
    private readonly hojaTurnoRepository: Repository<HojaRutaTurno>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(HistorialKmVehiculo)
    private readonly historialRepository: Repository<HistorialKmVehiculo>,
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
    @InjectRepository(ConstanciaRetiro)
    private readonly constanciaRepository: Repository<ConstanciaRetiro>,
    private readonly dataSource: DataSource,
    private readonly consulta: HojaRutaConsultaService,
    private readonly turnoService: TurnoService,
    private readonly constanciaService: ConstanciaRetiroService,
  ) {}

  async generar(
    empleadoTransportistaId: number,
    fechaPedida?: string,
    confirmar = false,
  ): Promise<HojaRutaDia> {
    const fecha = (fechaPedida ?? hoy()).slice(0, 10);
    const dia = await this.consulta.delDia(fecha, empleadoTransportistaId);

    if (!dia?.paradas.length) {
      throw new BadRequestException(
        'No hay turnos pendientes de retiro para esa fecha: no hay hoja de ruta para generar',
      );
    }
    if (dia.hojaRuta?.estado === ESTADO_HOJA.EN_PROCESO) return dia;
    if (dia.hojaRuta?.estado === ESTADO_HOJA.FINALIZADA) {
      throw new ConflictException(
        'La hoja de ruta de esa fecha ya fue finalizada',
      );
    }
    if (!dia.vehiculo) {
      throw new BadRequestException(
        'El transportista no tiene un vehículo asignado: no se puede generar la hoja de ruta',
      );
    }

    if (!confirmar) await this.verificarHojasAbiertas(empleadoTransportistaId);

    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id: dia.vehiculo.id },
    });
    if (!vehiculo)
      throw new NotFoundException('El vehículo del transportista no existe');
    const kmInicial = await this.kmInicialDe(vehiculo);

    await this.dataSource.transaction(async (m) => {
      const historial = await m.save(
        m.create(HistorialKmVehiculo, {
          vehiculoId: vehiculo.id,
          kmInicial,
          kmEstimado: dia.kmEstimados,
          createdAt: new Date(),
        }),
      );
      const hojaId = await this.guardarHoja(m, dia, {
        vehiculoId: vehiculo.id,
        estado: ESTADO_HOJA.EN_PROCESO,
        fechaInicio: new Date(),
        cantidadPedidos: dia.paradas.length,
        kmEstimados: dia.kmEstimados,
        historialKmId: historial.id,
      });
      await m.update(HistorialKmVehiculo, historial.id, { hojaRutaId: hojaId });
      await m.save(
        dia.paradas.map((p) =>
          m.create(HojaRutaTurno, { hojaRutaId: hojaId, turnoId: p.turnoId }),
        ),
      );
    });

    return this.consulta.delDiaOFallar(fecha, empleadoTransportistaId);
  }

  async confirmarRetiro(turnoId: number): Promise<RetiroConfirmado> {
    const fila = await this.hojaTurnoRepository.findOne({
      where: { turnoId },
      relations: [
        'hojaRuta',
        'hojaRuta.historialKm',
        'turno',
        'turno.estadoTurno',
        'turno.empleadoTransportista',
      ],
      order: { id: 'DESC' },
    });
    if (!fila || fila.hojaRuta.estado !== ESTADO_HOJA.EN_PROCESO) {
      throw new BadRequestException(
        'El turno no pertenece a una hoja de ruta iniciada: generá la hoja de ruta primero',
      );
    }
    if (!quedaPorRetirar(fila.turno.estadoTurno?.descripcion)) {
      throw new ConflictException('El retiro de este turno ya fue confirmado');
    }

    await this.turnoService.finalizarTurno(turnoId);

    return this.dataSource.transaction(async (m) => {
      const constanciaId = await this.emitirConstancia(
        m,
        fila.turno.donacionId,
        fila.turno.empleadoTransportista,
      );

      const pendientes = await m.getRepository(HojaRutaTurno).find({
        where: { hojaRutaId: fila.hojaRutaId },
        relations: ['turno', 'turno.estadoTurno'],
      });
      if (
        pendientes.some((f) =>
          quedaPorRetirar(f.turno?.estadoTurno?.descripcion),
        )
      ) {
        return { turnoId, constanciaId, hojaFinalizada: false };
      }

      const hojaFinalizada = await this.finalizarHoja(m, fila.hojaRuta);
      return { turnoId, constanciaId, hojaFinalizada };
    });
  }

  async constanciaDeTurno(turnoId: number) {
    const turno = await this.turnoService.findOne(turnoId);
    const retiro = turno.donacionId
      ? await this.retiroRepository.findOne({
          where: { donacionId: turno.donacionId, isActive: true },
        })
      : null;
    const constancia = retiro
      ? await this.constanciaRepository.findOne({
          where: { retiroId: retiro.id, isActive: true },
        })
      : null;

    if (!constancia) {
      throw new NotFoundException(
        'Este turno todavía no tiene constancia de retiro: confirmá el retiro primero',
      );
    }
    return this.constanciaService.datosDocumento(constancia.id);
  }

  private async verificarHojasAbiertas(empleadoTransportistaId: number) {
    const abiertas = await this.hojaRepository.find({
      where: {
        empleadoTransportistaId,
        estado: ESTADO_HOJA.EN_PROCESO,
        isActive: true,
      },
    });

    const conPendientes: { id: number; fecha: string; pendientes: number }[] =
      [];
    for (const hoja of abiertas) {
      const filas = await this.hojaTurnoRepository.find({
        where: { hojaRutaId: hoja.id },
        relations: ['turno', 'turno.estadoTurno'],
      });
      const pendientes = filas.filter((f) =>
        quedaPorRetirar(f.turno?.estadoTurno?.descripcion),
      ).length;
      if (pendientes)
        conPendientes.push({ id: hoja.id, fecha: hoja.fecha, pendientes });
    }

    if (conPendientes.length) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          code: 'HOJA_INICIADA_PENDIENTE',
          message:
            'Tenés otra hoja de ruta iniciada con turnos pendientes de retiro.',
          hojas: conPendientes,
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  private async kmInicialDe(vehiculo: Vehiculo): Promise<number> {
    const ultimo = await this.historialRepository.findOne({
      where: { vehiculoId: vehiculo.id, kmFinal: Not(IsNull()) },
      order: { id: 'DESC' },
    });
    const km = ultimo?.kmFinal ?? vehiculo.kilometraje;
    if (km === null || km === undefined) {
      throw new BadRequestException(
        `El vehículo ${vehiculo.patente} no tiene kilometraje cargado. Completalo en Vehículos antes de generar la hoja de ruta`,
      );
    }
    return km;
  }

  private async guardarHoja(
    m: EntityManager,
    dia: HojaRutaDia,
    datos: Partial<HojaRuta>,
  ): Promise<number> {
    const existente = dia.hojaRuta?.id;
    if (!existente) {
      const nueva = await m.save(
        m.create(HojaRuta, {
          empleadoTransportistaId: dia.empleadoTransportistaId,
          fecha: dia.fecha,
          ...datos,
        }),
      );
      return nueva.id;
    }

    const { affected } = await m.update(
      HojaRuta,
      { id: existente, estado: ESTADO_HOJA.PENDIENTE },
      datos,
    );
    if (!affected)
      throw new ConflictException('La hoja de ruta ya fue generada');
    return existente;
  }

  private async emitirConstancia(
    m: EntityManager,
    donacionId: number | null,
    transportista: EmpleadoTransportista | null,
  ): Promise<number | null> {
    if (!donacionId) return null;
    const retiro = await m
      .getRepository(Retiro)
      .findOne({ where: { donacionId, isActive: true } });
    if (!retiro) return null;

    const ahora = new Date();
    await m.update(Retiro, retiro.id, { fechaRetiro: ahora });

    const existente = await m
      .getRepository(ConstanciaRetiro)
      .findOne({ where: { retiroId: retiro.id, isActive: true } });
    if (existente) return existente.id;

    const nueva = await m.save(
      m.create(ConstanciaRetiro, {
        retiroId: retiro.id,
        fechaEmision: ahora,
        tecnicoId: transportista?.empleadoId,
      }),
    );
    return nueva.id;
  }

  private async finalizarHoja(
    m: EntityManager,
    hoja: HojaRuta,
  ): Promise<boolean> {
    const historial = hoja.historialKm;
    const kmEstimado = Number(historial?.kmEstimado ?? hoja.kmEstimados ?? 0);
    const kmFinal = Math.round((historial?.kmInicial ?? 0) + kmEstimado);

    const { affected } = await m.update(
      HojaRuta,
      { id: hoja.id, estado: ESTADO_HOJA.EN_PROCESO },
      { estado: ESTADO_HOJA.FINALIZADA, fechaFin: new Date() },
    );
    if (!affected) return false;

    if (historial)
      await m.update(HistorialKmVehiculo, historial.id, { kmFinal });
    await m.update(Vehiculo, hoja.vehiculoId, { kilometraje: kmFinal });
    return true;
  }
}
