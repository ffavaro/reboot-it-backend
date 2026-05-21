import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ModeloService } from './modelo.service';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';

@ApiTags('modelo')
@Controller('modelo')
export class ModeloController {
  constructor(private readonly modeloService: ModeloService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un modelo' })
  create(@Body() dto: CreateModeloDto) {
    return this.modeloService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los modelos activos (opcionalmente filtrar por marca o tipo)' })
  @ApiQuery({ name: 'marcaId', required: false, type: Number })
  @ApiQuery({ name: 'tipoId', required: false, type: Number })
  findAll(@Query('marcaId') marcaId?: string, @Query('tipoId') tipoId?: string) {
    if (marcaId) return this.modeloService.findByMarca(+marcaId);
    if (tipoId) return this.modeloService.findByTipo(+tipoId);
    return this.modeloService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un modelo por ID' })
  findOne(@Param('id') id: string) {
    return this.modeloService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un modelo' })
  update(@Param('id') id: string, @Body() dto: UpdateModeloDto) {
    return this.modeloService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un modelo (soft delete)' })
  remove(@Param('id') id: string) {
    return this.modeloService.remove(+id);
  }
}
