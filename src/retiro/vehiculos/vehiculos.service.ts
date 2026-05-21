import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
  ) {}

  create(dto: CreateVehiculoDto) {
    const vehiculo = this.vehiculoRepository.create(dto);
    return this.vehiculoRepository.save(vehiculo);
  }

  findAll() {
    return this.vehiculoRepository.find({
      where: { isActive: true },
      relations: ['tipoVehiculo'],
    });
  }

  async findOne(id: number) {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id },
      relations: ['tipoVehiculo'],
    });
    if (!vehiculo) throw new NotFoundException(`Vehículo ${id} no encontrado`);
    return vehiculo;
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    await this.findOne(id);
    await this.vehiculoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.vehiculoRepository.update(id, { isActive: false });
    return { message: 'Vehículo desactivado' };
  }
}
