import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstadoTurnoService } from './estado-turno.service';
import { CreateEstadoTurnoDto } from './dto/create-estado-turno.dto';
import { UpdateEstadoTurnoDto } from './dto/update-estado-turno.dto';

@ApiTags('estado-turno')
@Controller('estado-turno')
export class EstadoTurnoController {
  constructor(private readonly estadoTurnoService: EstadoTurnoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un estado de turno' })
  create(@Body() dto: CreateEstadoTurnoDto) {
    return this.estadoTurnoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de turno activos' })
  findAll() {
    return this.estadoTurnoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado de turno por ID' })
  findOne(@Param('id') id: string) {
    return this.estadoTurnoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estado de turno' })
  update(@Param('id') id: string, @Body() dto: UpdateEstadoTurnoDto) {
    return this.estadoTurnoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un estado de turno (soft delete)' })
  remove(@Param('id') id: string) {
    return this.estadoTurnoService.remove(+id);
  }
}
