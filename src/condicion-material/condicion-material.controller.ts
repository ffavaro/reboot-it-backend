import { Controller } from '@nestjs/common';
import { CondicionMaterialService } from './condicion-material.service';
import { CreateCondicionMaterialDto } from './dto/create-condicion-material.dto';
import { UpdateCondicionMaterialDto } from './dto/update-condicion-material.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('condicion-material')
export class CondicionMaterialController extends createCrudController({
  path: 'condicion-material',
  pantalla: 'condicion_material',
  sustantivo: 'condicion-material',
  plural: 'condicion_materiales',
  createDto: CreateCondicionMaterialDto,
  updateDto: UpdateCondicionMaterialDto,
  lectura: ['condicion_material', 'medio_almacenamiento', 'modelos'],
})  {
  constructor(condicionMaterialService: CondicionMaterialService) {
    super(condicionMaterialService)
  }
}
