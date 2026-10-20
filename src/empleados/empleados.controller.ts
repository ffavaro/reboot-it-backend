import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadosService } from './empleados.service';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('empleados')
@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(
    private readonly empleadosService: EmpleadosService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
  create(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.create(dto);
  }

  @Pantalla('empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios')
  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios']);
    const lista = await this.empleadosService.findAll();
    return a ? lista.filter((x) => a.empleados.has(x.id)) : lista;
  }

  @Pantalla('empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req, ['empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios']), 'empleados', +id);
    return this.empleadosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmpleadoDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'empleados', +id);
    return this.empleadosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'empleados', +id);
    return this.empleadosService.remove(+id);
  }
}
