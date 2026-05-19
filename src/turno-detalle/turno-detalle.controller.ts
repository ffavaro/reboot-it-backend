import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TurnoDetalleService } from './turno-detalle.service';
import { CreateTurnoDetalleDto } from './dto/create-turno-detalle.dto';
import { UpdateTurnoDetalleDto } from './dto/update-turno-detalle.dto';

@ApiTags('turno-detalle')
@Controller('turno-detalle')
export class TurnoDetalleController {
  constructor(private readonly service: TurnoDetalleService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un detalle de turno' })
  create(@Body() dto: CreateTurnoDetalleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los detalles de turno activos' })
  findAll() {
    return this.service.findAll();
  }

  @Get('turno/:turnoId')
  @ApiOperation({ summary: 'Listar detalles de un turno específico' })
  findByTurno(@Param('turnoId') turnoId: string) {
    return this.service.findByTurno(+turnoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle de turno por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un detalle de turno' })
  update(@Param('id') id: string, @Body() dto: UpdateTurnoDetalleDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un detalle de turno (soft delete)' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
