import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialKmVehiculo } from './entities/historial-km-vehiculo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';

@Injectable()
export class HistorialKmVehiculoService {
  constructor(
    @InjectRepository(HistorialKmVehiculo)
    private readonly historialRepository: Repository<HistorialKmVehiculo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
  ) { }

  async create(dto: CreateHistorialKmVehiculoDto) {
    return this.historialRepository.save(this.historialRepository.create(dto));
  }

  findAll() {
    return this.historialRepository.find({});
  }

  findOne(id: number) {
    return this.historialRepository.findOne({ where: { id } });
  }

  update(id: number, updateHistorialKmVehiculoDto: UpdateHistorialKmVehiculoDto) {
    return this.historialRepository.update(id, updateHistorialKmVehiculoDto);
  }

  remove(id: number) {
    return this.historialRepository.delete(id);
  }
}
