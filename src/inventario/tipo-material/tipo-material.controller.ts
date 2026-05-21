import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoMaterialService } from './tipo-material.service';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';

@ApiTags('tipo-material')
@Controller('tipo-material')
export class TipoMaterialController {
  constructor(private readonly tipoMaterialService: TipoMaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de material' })
  create(@Body() dto: CreateTipoMaterialDto) {
    return this.tipoMaterialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de material activos' })
  findAll() {
    return this.tipoMaterialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de material por ID' })
  findOne(@Param('id') id: string) {
    return this.tipoMaterialService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de material' })
  update(@Param('id') id: string, @Body() dto: UpdateTipoMaterialDto) {
    return this.tipoMaterialService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de material (soft delete)' })
  remove(@Param('id') id: string) {
    return this.tipoMaterialService.remove(+id);
  }
}
