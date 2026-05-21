import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadosService } from './empleados.service';

@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
  create(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados activos' })
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpleadoDto) {
    return this.empleadosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado (soft delete)' })
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(+id);
  }
}
