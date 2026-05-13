import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpleadoTransportista } from './empleado-transportista.entity';
import { CreateEmpleadoTransportistaDto } from './dto/create-empleado-transportista.dto';
import { UpdateEmpleadoTransportistaDto } from './dto/update-empleado-transportista.dto';

@Injectable()
export class EmpleadoTransportistaService {
  constructor(
    @InjectRepository(EmpleadoTransportista)
    private readonly empleadoTransportistaRepository: Repository<EmpleadoTransportista>,
  ) {}

  create(dto: CreateEmpleadoTransportistaDto) {
    const empleadoTransportista = this.empleadoTransportistaRepository.create(dto);
    return this.empleadoTransportistaRepository.save(empleadoTransportista);
  }

  findAll() {
    return this.empleadoTransportistaRepository.find({
      where: { isActive: true },
      relations: ['empleado', 'vehiculo'],
    });
  }

  async findOne(id: number) {
    const empleadoTransportista = await this.empleadoTransportistaRepository.findOne({
      where: { id },
      relations: ['empleado', 'vehiculo'],
    });
    if (!empleadoTransportista) throw new NotFoundException(`EmpleadoTransportista ${id} no encontrado`);
    return empleadoTransportista;
  }

  async update(id: number, dto: UpdateEmpleadoTransportistaDto) {
    await this.findOne(id);
    await this.empleadoTransportistaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.empleadoTransportistaRepository.update(id, { isActive: false });
    return { message: 'EmpleadoTransportista desactivado' };
  }
}
