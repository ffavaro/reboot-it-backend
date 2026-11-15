import { Controller } from '@nestjs/common';
import { TipoService } from './tipo.service';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('tipo')
export class TipoController extends createCrudController({
  path: 'tipo',
  pantalla: 'tipos',
  sustantivo: 'tipo',
  plural: 'tipos',
  createDto: CreateTipoDto,
  updateDto: UpdateTipoDto,
   lectura: ['tipos'],
}){
  constructor(services: TipoService) {
    super(services)
  }
}
