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

const ESTADO_ASIGNADO = 'Asignado';
const ESTADO_FINALIZADO = 'Finalizado';
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
    return this.findOne(id);
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

    const estadoFinalizado = await this.estadoTurnoRepository.findOne({
      where: { descripcion: ESTADO_FINALIZADO, isActive: true },
    });
    if (!estadoFinalizado) throw new NotFoundException(`Estado "${ESTADO_FINALIZADO}" no encontrado en la base de datos.`);

    const condicionPendiente = await this.condicionMaterialRepository.findOne({
      where: { condicion: CONDICION_PENDIENTE, isActive: true },
    });
    if (!condicionPendiente) throw new NotFoundException(`Condición "${CONDICION_PENDIENTE}" no encontrada en la base de datos.`);

    await this.turnoRepository.update(id, { estadoTurnoId: estadoFinalizado.id });

    if (turno.detalles?.length) {
      await Promise.all(
        turno.detalles.map((detalle) =>
          this.materialRepository.save(
            this.materialRepository.create({
              tipoMaterialId: detalle.tipoMaterialId,
              condicionMaterialId: condicionPendiente.id,
              descripcion: detalle.descripcion ?? undefined,
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
