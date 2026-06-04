import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

const ESTADO_ASIGNADO = 'Asignado';
const ESTADO_DONACION_EN_PROCESO = 'En proceso';
const ESTADO_EN_CLASIFICACION = 'En Clasificacion';
const CONDICION_PENDIENTE = 'Pendiente de Clasificar';
const RELATIONS = ['donante', 'estadoTurno', 'detalles', 'detalles.tipoMaterial', 'empleado', 'empleadoTransportista', 'empleadoTransportista.empleado'];

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
  ) {}

  create(dto: CreateTurnoDto) {
    const turno = this.turnoRepository.create(dto);
    return this.turnoRepository.save(turno);
  }

  findAll() {
    return this.turnoRepository.find({
      where: { isActive: true },
      relations: RELATIONS,
    });
  }

  async findOne(id: number) {
    const turno = await this.turnoRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);
    return turno;
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
    
    if (estadoEnProceso) {
      const donacion = await this.donacionRepository.findOne({
        where: { donanteId: turno.donanteId, isActive: true },
        order: { createdAt: 'DESC' },
      });
      if (donacion) {
        await this.donacionRepository.update(donacion.id, { estadoDonacionId: estadoEnProceso.id });
      }
    }

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

    await this.turnoRepository.update(id, { estadoTurnoId: estadoEnClasificacion.id });

    if (turno.donacionId && turno.empleadoTransportistaId) {
      const transportista = await this.transportistaRepository.findOne({
        where: { id: turno.empleadoTransportistaId },
      });
      if (!transportista?.vehiculoId) throw new BadRequestException('El empleado transportista no tiene un vehículo asignado.');

      const retiroExistente = await this.retiroRepository.findOne({
        where: { donacionId: turno.donacionId, isActive: true },
      });
      if (!retiroExistente) {
        await this.retiroRepository.save(
          this.retiroRepository.create({
            donacionId: turno.donacionId,
            empleadoTransportistaId: turno.empleadoTransportistaId,
            vehiculoId: transportista.vehiculoId,
            fechaInicio: turno.fechaHora,
            direccion: turno.donante.direccion,
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
