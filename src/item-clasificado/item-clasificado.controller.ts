import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ItemClasificadoService } from './item-clasificado.service';
import { CreateItemClasificadoDto } from './dto/create-item-clasificado.dto';
import { UpdateItemClasificadoDto } from './dto/update-item-clasificado.dto';

@ApiTags('item-clasificado')
@Controller('item-clasificado')
export class ItemClasificadoController {
  constructor(private readonly service: ItemClasificadoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un ítem clasificado' })
  create(@Body() dto: CreateItemClasificadoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los ítems clasificados activos' })
  findAll() {
    return this.service.findAll();
  }

  @Get('clasificacion/:clasificacionId')
  @ApiOperation({ summary: 'Listar ítems de una clasificación específica' })
  findByClasificacion(@Param('clasificacionId') clasificacionId: string) {
    return this.service.findByClasificacion(+clasificacionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un ítem clasificado por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un ítem clasificado' })
  update(@Param('id') id: string, @Body() dto: UpdateItemClasificadoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un ítem clasificado (soft delete)' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
