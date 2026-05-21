import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CondicionMaterialService } from './condicion-material.service';
import { CreateCondicionMaterialDto } from './dto/create-condicion-material.dto';
import { UpdateCondicionMaterialDto } from './dto/update-condicion-material.dto';

@ApiTags('condicion-material')
@Controller('condicion-material')
export class CondicionMaterialController {
  constructor(private readonly condicionMaterialService: CondicionMaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una condición de material' })
  create(@Body() dto: CreateCondicionMaterialDto) {
    return this.condicionMaterialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las condiciones de material activas' })
  findAll() {
    return this.condicionMaterialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una condición de material por ID' })
  findOne(@Param('id') id: string) {
    return this.condicionMaterialService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una condición de material' })
  update(@Param('id') id: string, @Body() dto: UpdateCondicionMaterialDto) {
    return this.condicionMaterialService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una condición de material (soft delete)' })
  remove(@Param('id') id: string) {
    return this.condicionMaterialService.remove(+id);
  }
}
