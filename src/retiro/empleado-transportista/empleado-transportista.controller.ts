import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmpleadoTransportistaService } from './empleado-transportista.service';
import { CreateEmpleadoTransportistaDto } from './dto/create-empleado-transportista.dto';
import { UpdateEmpleadoTransportistaDto } from './dto/update-empleado-transportista.dto';

@ApiTags('empleado-transportista')
@Controller('empleado-transportista')
export class EmpleadoTransportistaController {
  constructor(private readonly empleadoTransportistaService: EmpleadoTransportistaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un empleado transportista' })
  create(@Body() dto: CreateEmpleadoTransportistaDto) {
    return this.empleadoTransportistaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados transportistas activos' })
  findAll() {
    return this.empleadoTransportistaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado transportista por ID' })
  findOne(@Param('id') id: string) {
    return this.empleadoTransportistaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado transportista' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpleadoTransportistaDto) {
    return this.empleadoTransportistaService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado transportista (soft delete)' })
  remove(@Param('id') id: string) {
    return this.empleadoTransportistaService.remove(+id);
  }
}
