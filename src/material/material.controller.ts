import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ClasificarMaterialDto } from './dto/clasificar-material.dto';
import { ReporteMaterialDto } from './dto/reporte-material.dto';

@ApiTags('material')
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un material' })
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los materiales activos' })
  findAll() {
    return this.materialService.findAll();
  }

  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de inventario (materiales) con filtros' })
  reporte(@Query() query: ReporteMaterialDto) {
    return this.materialService.reporte(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un material por ID' })
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un material' })
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(+id, dto);
  }

  @Patch(':id/clasificar')
  @ApiOperation({ summary: 'Clasificar material: actualizar condición y crear proceso de destrucción si aplica' })
  clasificar(@Param('id') id: string, @Body() dto: ClasificarMaterialDto) {
    return this.materialService.clasificarMaterial(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un material (soft delete)' })
  remove(@Param('id') id: string) {
    return this.materialService.remove(+id);
  }
}
