import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno } from './turno.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { AsignarEmpleadoDto } from './dto/asignar-empleado.dto';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { Empleado } from '../empleados/empleado.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { RegistroFotografico } from '../registro-fotografico/registro-fotografico.entity';
import { Material } from '../material/material.entity';
import { CondicionMaterial } from '../condicion-material/condicion-material.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { Lote } from '../lote/lote.entity';
import { Retiro } from '../retiro/retiro.entity';
import { CONDICION_MATERIAL, ESTADO_DONACION, ESTADO_TURNO } from '../common/constants/estados';

const ESTADO_ASIGNADO = ESTADO_TURNO.ASIGNADO;
const ESTADO_DONACION_EN_PROCESO = ESTADO_DONACION.EN_PROCESO;
const ESTADO_EN_CLASIFICACION = ESTADO_TURNO.EN_CLASIFICACION;
// Los materiales de un turno finalizado quedan "A definir" hasta que se los clasifica
const CONDICION_PENDIENTE = CONDICION_MATERIAL.A_DEFINIR;
const RELATIONS = ['donante', 'donante.tipoDonante', 'estadoTurno', 'detalles', 'detalles.tipoMaterial', 'empleado', 'empleadoTransportista', 'empleadoTransportista.empleado'];

import { validarPesoDonacionVehiculo } from '../common/peso-vehiculo';
import { NotificacionDonacionService } from '../notificaciones/notificacion-donacion.service';


// Antelación mínima con la que el donante puede reprogramar o cancelar su turno
const HORAS_ANTELACION_DONANTE = 24;

@Injectable()
export class TurnoService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(EstadoTurno)
    private readonly estadoTurnoRepository: Repository<EstadoTurno>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(EmpleadoTransportista)
    private readonly transportistaRepository: Repository<EmpleadoTransportista>,
    @InjectRepository(RegistroFotografico)
    private readonly registroFotograficoRepository: Repository<RegistroFotografico>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(CondicionMaterial)
    private readonly condicionMaterialRepository: Repository<CondicionMaterial>,
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(EstadoDonacion)
    private readonly estadoDonacionRepository: Repository<EstadoDonacion>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
    private readonly notificaciones: NotificacionDonacionService,
  ) {}

  create(dto: CreateTurnoDto) {
    const turno = this.turnoRepository.create(dto);
    return this.turnoRepository.save(turno);
  }

  private soloDetallesActivos<T extends { detalles?: { isActive: boolean }[] }>(turno: T): T {
    if (turno.detalles) turno.detalles = turno.detalles.filter((d) => d.isActive);
    return turno;
  }

  async findAll() {
    const turnos = await this.turnoRepository.find({
      where: { isActive: true },
      relations: RELATIONS,
    });
    return turnos.map((t) => this.soloDetallesActivos(t));
  }

  async findOne(id: number) {
    const turno = await this.turnoRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);
    return this.soloDetallesActivos(turno);
  }

  /**
   * Regla L del Donante: reprograma o cancela su turno solo si la donación sigue pendiente y faltan al menos
   * 24 horas para el turno. Un turno nuevo tiene que quedar en el futuro.
   */
  async validarCambioDelDonante(id: number, nuevaFecha?: Date | string) {
    const turno = await this.findOne(id);
    if (turno.donacionId) {
      const donacion = await this.donacionRepository.findOne({ where: { id: turno.donacionId }, relations: ['estadoDonacion'] });
      const estado = donacion?.estadoDonacion?.descripcion;
      if (estado && estado !== ESTADO_DONACION.PENDIENTE) {
        throw new ConflictException(`La donación está "${estado}": el turno solo se puede reprogramar o cancelar mientras está pendiente.`);
      }
    }
    const faltan = new Date(turno.fechaHora).getTime() - Date.now();
    if (faltan < HORAS_ANTELACION_DONANTE * 3600 * 1000) {
      throw new ConflictException(`El turno solo se puede reprogramar o cancelar con al menos ${HORAS_ANTELACION_DONANTE} horas de antelación.`);
    }
    if (nuevaFecha !== undefined && new Date(nuevaFecha).getTime() <= Date.now()) {
      throw new BadRequestException('La nueva fecha del turno tiene que ser posterior a hoy.');
    }
  }

  async update(id: number, dto: UpdateTurnoDto) {
    await this.findOne(id);
    await this.turnoRepository.update(id, dto);
    const updated = await this.findOne(id);
    
    return updated;
  }

  async asignarEmpleado(id: number, dto: AsignarEmpleadoDto) {
    const turno = await this.findOne(id);

    if (turno.necesitaRetiro) {
      if (!dto.empleadoTransportistaId) {
        throw new BadRequestException('El turno requiere retiro: debe asignarse un empleado transportista.');
      }
      const transportista = await this.transportistaRepository.findOne({
        where: { id: dto.empleadoTransportistaId, isActive: true },
      });
      if (!transportista) throw new NotFoundException('Empleado transportista no encontrado.');
      // el vehículo del transportista tiene que soportar el peso estimado de la donación
      await validarPesoDonacionVehiculo(this.turnoRepository.manager, turno.donacionId, transportista.vehiculoId);
    } else {
      if (!dto.empleadoId) {
        throw new BadRequestException('Debe asignarse un empleado.');
      }
      const empleado = await this.empleadoRepository.findOne({
        where: { id: dto.empleadoId, isActive: true },
      });
      if (!empleado) throw new NotFoundException('Empleado no encontrado.');
    }

    const estadoAsignado = await this.estadoTurnoRepository.findOne({
      where: { descripcion: ESTADO_ASIGNADO, isActive: true },
    });
    if (!estadoAsignado) throw new NotFoundException(`Estado "${ESTADO_ASIGNADO}" no encontrado en la base de datos.`);

    await this.turnoRepository.update(id, {
      empleadoId: turno.necesitaRetiro ? null : dto.empleadoId,
      empleadoTransportistaId: turno.necesitaRetiro ? dto.empleadoTransportistaId : null,
      estadoTurnoId: estadoAsignado.id,
    });

    const estadoEnProceso = await this.estadoDonacionRepository.findOne({
      where: { descripcion: ESTADO_DONACION_EN_PROCESO, isActive: true },
    });
    
    // Pasa a "En proceso" la donación asociada a ESTE turno (un donante puede tener varias donaciones)
    if (estadoEnProceso && turno.donacionId) {
      const antes = await this.notificaciones.estadoActual(turno.donacionId);
      await this.donacionRepository.update(turno.donacionId, { estadoDonacionId: estadoEnProceso.id });
      void this.notificaciones.estadoCambiado(turno.donacionId, antes);
    }

    return this.findOne(id);
  }

  /**
   * Turno de sucursal (la donación se entrega en la sucursal): el equipo recibe los materiales y el turno pasa de
   * "Asignado" a "Retiro confirmado", paso previo a clasificarlos. Los turnos con retiro a domicilio lo hacen con la
   * hoja de ruta del transportista.
   */
  async confirmarRecepcion(id: number) {
    const turno = await this.findOne(id);
    if (turno.necesitaRetiro) {
      throw new BadRequestException('Este turno es con retiro a domicilio: el retiro lo confirma el transportista desde su hoja de ruta.');
    }
    const estado = turno.estadoTurno?.descripcion;
    if (estado !== ESTADO_ASIGNADO) {
      throw new ConflictException(estado === ESTADO_TURNO.RETIRO_CONFIRMADO ? 'El turno ya tiene el retiro confirmado.' : `El turno está "${estado}": solo se puede clasificar un turno asignado.`);
    }
    if (!turno.empleadoId) throw new BadRequestException('Asigná un empleado al turno antes de clasificarlo.');
    const confirmado = await this.estadoTurnoRepository.findOne({ where: { descripcion: ESTADO_TURNO.RETIRO_CONFIRMADO, isActive: true } });
    if (!confirmado) throw new NotFoundException(`Estado "${ESTADO_TURNO.RETIRO_CONFIRMADO}" no encontrado en la base de datos.`);
    await this.turnoRepository.update(id, { estadoTurnoId: confirmado.id });
    return this.findOne(id);
  }

  async finalizarTurno(id: number) {
    const turno = await this.findOne(id);

    const cantFotos = await this.registroFotograficoRepository.count({
      where: { turnoId: id, isActive: true },
    });
    if (cantFotos === 0) {
      throw new BadRequestException('Debe registrar al menos una foto de los materiales antes de finalizar el turno.');
    }

    const estadoEnClasificacion = await this.estadoTurnoRepository.findOne({
      where: { descripcion: ESTADO_EN_CLASIFICACION, isActive: true },
    });
    if (!estadoEnClasificacion) throw new NotFoundException(`Estado "${ESTADO_EN_CLASIFICACION}" no encontrado en la base de datos.`);

    const condicionPendiente = await this.condicionMaterialRepository.findOne({
      where: { condicion: CONDICION_PENDIENTE, isActive: true },
    });
    if (!condicionPendiente) throw new NotFoundException(`Condición "${CONDICION_PENDIENTE}" no encontrada en la base de datos.`);

    // Se valida todo lo del retiro antes de escribir, para no dejar el turno a medio finalizar
    const generaRetiro = !!(turno.donacionId && turno.empleadoTransportistaId);
    let vehiculoRetiroId: number | null = null;
    let direccionRetiro: string | null = null;
    if (generaRetiro) {
      const transportista = await this.transportistaRepository.findOne({
        where: { id: turno.empleadoTransportistaId as number },
      });
      if (!transportista?.vehiculoId) throw new BadRequestException('El empleado transportista no tiene un vehículo asignado.');
      vehiculoRetiroId = transportista.vehiculoId;

      // Si el donante cargó una dirección alternativa para esta donación, el retiro va ahí;
      // si no, a la dirección de su perfil
      const donacion = await this.donacionRepository.findOne({ where: { id: turno.donacionId as number } });
      direccionRetiro = donacion?.direccionRetiro?.trim() || turno.donante.direccion || null;
    }

    await this.turnoRepository.update(id, { estadoTurnoId: estadoEnClasificacion.id });

    if (generaRetiro) {
      const retiroExistente = await this.retiroRepository.findOne({
        where: { donacionId: turno.donacionId as number, isActive: true },
      });
      if (!retiroExistente) {
        await this.retiroRepository.save(
          this.retiroRepository.create({
            donacionId: turno.donacionId as number,
            empleadoTransportistaId: turno.empleadoTransportistaId as number,
            vehiculoId: vehiculoRetiroId as number,
            fechaInicio: turno.fechaHora,
            direccion: direccionRetiro as string,
          }),
        );
      }
    }

    if (turno.detalles?.length) {
      const lote = turno.donacionId
        ? await this.loteRepository.findOne({ where: { donacionId: turno.donacionId, isActive: true } })
        : null;

      await Promise.all(
        turno.detalles.map((detalle) =>
          this.materialRepository.save(
            this.materialRepository.create({
              tipoMaterialId: detalle.tipoMaterialId,
              condicionMaterialId: condicionPendiente.id,
              descripcion: detalle.descripcion ?? undefined,
              loteId: lote?.id ?? null,
            }),
          ),
        ),
      );
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.turnoRepository.update(id, { isActive: false });
    return { message: 'Turno desactivado' };
  }
}
