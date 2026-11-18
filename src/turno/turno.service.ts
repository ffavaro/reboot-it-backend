import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
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
import { validarPesoDonacionVehiculo } from '../utils/peso-vehiculo';
import { CONDICION_PENDIENTE, ESTADO_ASIGNADO, ESTADO_DONACION_EN_PROCESO, ESTADO_EN_CLASIFICACION } from '@app/utils/helpers';
import { exigirActivo, buscarActivo } from '@app/utils/catalogo';

@Injectable()
export class TurnoService extends CrudService<Turno, CreateTurnoDto, UpdateTurnoDto> {
  constructor(@InjectRepository(Turno) repo: Repository<Turno>) {
    super(repo, {
      etiqueta: 'Turno',
      genero: 'm',
      relations: ['donante', 'estadoTurno', 'detalles', 'detalles.tipoMaterial', 'empleado', 'empleadoTransportista', 'empleadoTransportista.empleado'],
      order: { id: 'DESC' },
    });
  }

  async asignarEmpleado(id: number, dto: AsignarEmpleadoDto) {
    const turno = await this.findOne(id);
    const m = this.repo.manager;

    if (turno.necesitaRetiro) {
      if (!dto.empleadoTransportistaId) {
        throw new BadRequestException('El turno requiere retiro: debe asignarse un empleado transportista.');
      }
      const transportista = await exigirActivo(m, EmpleadoTransportista, { id: dto.empleadoTransportistaId }, 'Empleado transportista no encontrado.');
      await validarPesoDonacionVehiculo(m, turno.donacionId, transportista.vehiculoId);
    } else {
      if (!dto.empleadoId) throw new BadRequestException('Debe asignarse un empleado.');
      await exigirActivo(m, Empleado, { id: dto.empleadoId }, 'Empleado no encontrado.');
    }

    const estadoAsignado = await exigirActivo(m, EstadoTurno, { descripcion: ESTADO_ASIGNADO }, `Estado "${ESTADO_ASIGNADO}" no encontrado en la base de datos.`);

    await this.repo.update(id, {
      empleadoId: turno.necesitaRetiro ? null : dto.empleadoId,
      empleadoTransportistaId: turno.necesitaRetiro ? dto.empleadoTransportistaId : null,
      estadoTurnoId: estadoAsignado.id,
    });

    const estadoEnProceso = await buscarActivo(m, EstadoDonacion, { descripcion: ESTADO_DONACION_EN_PROCESO });
    if (estadoEnProceso) {
      const donacion = await m.findOne(Donacion, {
        where: { donanteId: turno.donanteId, isActive: true },
        order: { createdAt: 'DESC' },
      });
      if (donacion) await m.update(Donacion, donacion.id, { estadoDonacionId: estadoEnProceso.id });
    }

    return this.findOne(id);
  }

  async finalizarTurno(id: number) {
    const turno = await this.findOne(id);
    const m = this.repo.manager;

    const cantFotos = await m.count(RegistroFotografico, { where: { turnoId: id, isActive: true } });
    if (cantFotos === 0) {
      throw new BadRequestException('Debe registrar al menos una foto de los materiales antes de finalizar el turno.');
    }

    const estadoEnClasificacion = await exigirActivo(m, EstadoTurno, { descripcion: ESTADO_EN_CLASIFICACION }, `Estado "${ESTADO_EN_CLASIFICACION}" no encontrado en la base de datos.`);
    const condicionPendiente = await exigirActivo(m, CondicionMaterial, { condicion: CONDICION_PENDIENTE }, `Condición "${CONDICION_PENDIENTE}" no encontrada en la base de datos.`);

    await this.repo.update(id, { estadoTurnoId: estadoEnClasificacion.id });

    if (turno.donacionId && turno.empleadoTransportistaId) {
      const transportista = await m.findOne(EmpleadoTransportista, { where: { id: turno.empleadoTransportistaId } });
      if (!transportista?.vehiculoId) throw new BadRequestException('El empleado transportista no tiene un vehículo asignado.');

      if (!(await buscarActivo(m, Retiro, { donacionId: turno.donacionId }))) {
        await m.save(
          m.create(Retiro, {
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
      const lote = turno.donacionId ? await buscarActivo(m, Lote, { donacionId: turno.donacionId }) : null;
      await Promise.all(
        turno.detalles.map((detalle) =>
          m.save(
            m.create(Material, {
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
}
