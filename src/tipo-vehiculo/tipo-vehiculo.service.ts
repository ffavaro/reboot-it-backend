import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoVehiculo } from './tipo-vehiculo.entity';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class TipoVehiculoService extends CrudService<TipoVehiculo, CreateTipoVehiculoDto, UpdateTipoVehiculoDto> {
    constructor(
      @InjectRepository(TipoVehiculo) repo: Repository<TipoVehiculo>
    ) {
      super(repo, { etiqueta: 'TipoVehiculo', genero: 'f'})
    }
}
