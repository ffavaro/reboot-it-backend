import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TurnoDetalleService } from './turno-detalle.service';
import { CreateTurnoDetalleDto } from './dto/create-turno-detalle.dto';
import { UpdateTurnoDetalleDto } from './dto/update-turno-detalle.dto';
import { Accion, Pantalla } from '../auth/auth.decorators';

// Endpoints internos (el frontend no los usa): solo quien puede editar turnos por completo
@Accion('editar')
@Pantalla('turnos!')
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
  findByTurno(@Param('turnoId', ParseIdPipe) turnoId: number) {
    return this.service.findByTurno(+turnoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle de turno por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un detalle de turno' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateTurnoDetalleDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un detalle de turno (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.service.remove(+id);
  }
}
