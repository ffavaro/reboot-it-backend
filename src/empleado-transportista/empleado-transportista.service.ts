import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpleadoTransportista } from './empleado-transportista.entity';
import { CreateEmpleadoTransportistaDto } from './dto/create-empleado-transportista.dto';
import { UpdateEmpleadoTransportistaDto } from './dto/update-empleado-transportista.dto';
import { Empleado } from '../empleados/empleado.entity';

@Injectable()
export class EmpleadoTransportistaService {
  constructor(
    @InjectRepository(EmpleadoTransportista)
    private readonly empleadoTransportistaRepository: Repository<EmpleadoTransportista>,
  ) {}

  // Solo se puede asignar como transportista a un empleado activo que tiene carnet de conducir
  private async assertEmpleadoConCarnet(empleadoId: number) {
    const empleado = await this.empleadoTransportistaRepository.manager.getRepository(Empleado).findOne({ where: { id: empleadoId } });
    if (!empleado) throw new NotFoundException(`Empleado ${empleadoId} no encontrado`);
    if (!empleado.isActive) throw new ConflictException('El empleado está desactivado: no se lo puede asignar como transportista.');
    if (!empleado.tieneCarnet) {
      throw new ConflictException('El empleado no tiene carnet de conducir: no se lo puede asignar como transportista.');
    }
  }

  async create(dto: CreateEmpleadoTransportistaDto) {
    await this.assertEmpleadoConCarnet(dto.empleadoId);
    const empleadoTransportista = this.empleadoTransportistaRepository.create(dto);
    return this.empleadoTransportistaRepository.save(empleadoTransportista);
  }

  findAll() {
    return this.empleadoTransportistaRepository.find({
      where: { isActive: true },
      relations: ['empleado', 'vehiculo', 'vehiculo.tipoVehiculo'],
    });
  }

  async findOne(id: number) {
    const empleadoTransportista = await this.empleadoTransportistaRepository.findOne({
      where: { id },
      relations: ['empleado', 'vehiculo', 'vehiculo.tipoVehiculo'],
    });
    if (!empleadoTransportista) throw new NotFoundException(`EmpleadoTransportista ${id} no encontrado`);
    return empleadoTransportista;
  }

  async update(id: number, dto: UpdateEmpleadoTransportistaDto) {
    const actual = await this.findOne(id);
    if (dto.empleadoId !== undefined && dto.empleadoId !== actual.empleadoId) await this.assertEmpleadoConCarnet(dto.empleadoId);
    await this.empleadoTransportistaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.empleadoTransportistaRepository.update(id, { isActive: false });
    return { message: 'EmpleadoTransportista desactivado' };
  }
}
