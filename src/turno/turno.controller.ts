import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TurnoService } from './turno.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { AsignarEmpleadoDto } from './dto/asignar-empleado.dto';

@ApiTags('turno')
@Controller('turno')
export class TurnoController {
  constructor(private readonly turnoService: TurnoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un turno' })
  create(@Body() dto: CreateTurnoDto) {
    return this.turnoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los turnos activos' })
  findAll() {
    return this.turnoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un turno por ID' })
  findOne(@Param('id') id: string) {
    return this.turnoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un turno' })
  update(@Param('id') id: string, @Body() dto: UpdateTurnoDto) {
    return this.turnoService.update(+id, dto);
  }

  @Patch(':id/asignar')
  @ApiOperation({ summary: 'Asignar empleado al turno y pasar a estado Asignado' })
  asignarEmpleado(@Param('id') id: string, @Body() dto: AsignarEmpleadoDto) {
    return this.turnoService.asignarEmpleado(+id, dto);
  }

  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar un turno (requiere al menos una foto registrada)' })
  finalizar(@Param('id') id: string) {
    return this.turnoService.finalizarTurno(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un turno (soft delete)' })
  remove(@Param('id') id: string) {
    return this.turnoService.remove(+id);
  }
}
