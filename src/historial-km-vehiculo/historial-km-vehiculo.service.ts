import { Injectable } from '@nestjs/common';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';

@Injectable()
export class HistorialKmVehiculoService {
  create(createHistorialKmVehiculoDto: CreateHistorialKmVehiculoDto) {
    return 'This action adds a new historialKmVehiculo';
  }

  findAll() {
    return `This action returns all historialKmVehiculo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historialKmVehiculo`;
  }

  update(id: number, updateHistorialKmVehiculoDto: UpdateHistorialKmVehiculoDto) {
    return `This action updates a #${id} historialKmVehiculo`;
  }

  remove(id: number) {
    return `This action removes a #${id} historialKmVehiculo`;
  }
}
