import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadosService, EstadoEmpleados } from './empleados.service';
import { Accion, Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';
import { PermisosService } from '../permisos/permisos.service';

@Pantalla('empleados')
@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(
    private readonly empleadosService: EmpleadosService,
    private readonly ambito: AmbitoService,
    private readonly permisos: PermisosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
  create(@Body() dto: CreateEmpleadoDto, @Req() req: RequestConUsuario) {
    return this.empleadosService.create(dto, req.user);
  }

  @Pantalla('empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios')
  @Get()
  @ApiOperation({ summary: 'Listar empleados: activos por defecto; ?estado=inactivos|todos solo para quien puede dar de baja' })
  async findAll(@Req() req: RequestConUsuario, @Query('estado') estadoPedido?: string) {
    const estado: EstadoEmpleados = estadoPedido === 'inactivos' || estadoPedido === 'todos' ? estadoPedido : 'activos';
    // Ver a los desactivados es parte de poder desactivar y reactivar
    if (estado !== 'activos') await this.permisos.exigir(req.user?.rolId, ['empleados'], 'baja');
    const a = await this.ambito.de(req, ['empleados', 'empleado_transportista', 'hoja_ruta', 'usuarios']);
    const lista = await this.empleadosService.findAll(estado);
    return a ? lista.filter((x) => a.empleados.has(x.id)) : lista;
  }

  @Pantalla('empleados', 'proceso_destruccion', 'reporte_procesos_destruccion')
  @Get('combo')
  @ApiOperation({ summary: 'Empleados activos con lo mínimo para un combo (id, nombre, apellido y cargo): sin datos personales' })
  async combo() {
    const lista = await this.empleadosService.findAll();
    return lista.map((e) => ({ id: e.id, nombre: e.nombre, apellido: e.apellido, cargo: e.cargo, rol: e.rol ? { id: e.rol.id, nombre: e.rol.nombre } : undefined }));
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
    return this.empleadosService.update(+id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado y su usuario sin borrar sus datos (solo SysAdmin)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'empleados', +id);
    return this.empleadosService.remove(+id, req.user);
  }

  @Accion('baja')
  @Patch(':id/reactivar')
  @ApiOperation({ summary: 'Reactivar un empleado desactivado, con su usuario (solo SysAdmin)' })
  async reactivar(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'empleados', +id);
    return this.empleadosService.reactivar(+id);
  }
}
