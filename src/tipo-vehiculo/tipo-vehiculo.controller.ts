import { Controller } from '@nestjs/common';
import { TipoVehiculoService } from './tipo-vehiculo.service';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('tipo-vehiculo')
export class TipoVehiculoController  extends createCrudController({
  path: 'tipo-vehiculo',
  pantalla: 'vehiculos',
  sustantivo: 'tipo-vehiculo',
  plural: 'vehiculos',
  createDto: CreateTipoVehiculoDto,
  updateDto: UpdateTipoVehiculoDto,
   lectura: ['tipo-vehiculo', 'vehiculos'],
}){
  constructor(service: TipoVehiculoService) {
    super(service)
  }
}
