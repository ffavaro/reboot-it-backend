import {  Controller } from '@nestjs/common';
import { TipoMaterialService } from './tipo-material.service';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('tipo-material')
export class TipoMaterialController extends createCrudController({
  path: 'tipo-material',
  pantalla: 'tipos_material',
  sustantivo: 'tipo-material',
  plural: 'tipo-materiales',
  createDto: CreateTipoMaterialDto,
  updateDto: UpdateTipoMaterialDto,
  lectura: ['tipos_material', 'materiales', 'donaciones'],
}) {
  constructor( tipoMaterialService: TipoMaterialService) {
    super(tipoMaterialService)
  }
}
