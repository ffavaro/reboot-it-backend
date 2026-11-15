import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class VehiculosService extends CrudService<Vehiculo, CreateVehiculoDto, UpdateVehiculoDto> {
  constructor(@InjectRepository(Vehiculo) repo: Repository<Vehiculo>) {
    super(repo, { etiqueta: 'Vehículo', genero: 'm', relations: ['tipoVehiculo'], order: { id: 'DESC' } });
  }
}
