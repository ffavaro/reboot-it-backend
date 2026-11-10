import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadosService } from './empleados.service';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';
import { PermisosService } from '../permisos/permisos.service';

@Pantalla('empleados')
@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(
    private readonly empleadosService: EmpleadosService,
    private readonly alcance: AlcanceService,
    private readonly permisos: PermisosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
  async create(@Body() dto: CreateEmpleadoDto, @Req() req: RequestConUsuario) {
    await this.permisos.exigirPuedeAsignarRol(dto.rolId, req.user?.rolId);
    return this.empleadosService.create(dto);
  }

  @Pantalla('empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios', 'proceso_destruccion')
  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados activos' })
  findAll(@Req() req: RequestConUsuario) {
    return this.empleadosService.findAll(this.alcance.condicion(req, 'empleados'));
  }

  @Pantalla('empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'empleados', +id);
    return this.empleadosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmpleadoDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'empleados', +id);
    await this.permisos.exigirPuedeAsignarRol(dto.rolId, req.user?.rolId);
    return this.empleadosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'empleados', +id);
    return this.empleadosService.remove(+id);
  }
}
