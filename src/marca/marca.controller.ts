import {  Controller } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('marca')
export class MarcaController extends createCrudController({
  path: 'marca',
  pantalla: 'marcas',
  sustantivo: 'marca',
  plural: 'marcas',
  createDto: CreateMarcaDto,
  updateDto: UpdateMarcaDto,
   lectura: ['marcas', 'medio_almacenamiento', 'modelos'],
}){
  constructor(marcaService: MarcaService) {
    super(marcaService)
  }
}
