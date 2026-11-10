import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmpleadoTransportistaService } from './empleado-transportista.service';
import { CreateEmpleadoTransportistaDto } from './dto/create-empleado-transportista.dto';
import { UpdateEmpleadoTransportistaDto } from './dto/update-empleado-transportista.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('empleado_transportista')
@ApiTags('empleado-transportista')
@Controller('empleado-transportista')
export class EmpleadoTransportistaController {
  constructor(
    private readonly empleadoTransportistaService: EmpleadoTransportistaService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un empleado transportista' })
  create(@Body() dto: CreateEmpleadoTransportistaDto) {
    return this.empleadoTransportistaService.create(dto);
  }

  @Pantalla('empleado_transportista', 'turnos', 'retiros', 'hoja_ruta')
  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados transportistas activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const transportistas = await this.empleadoTransportistaService.findAll(this.alcance.condicion(req, 'transportistas'));
    return this.alcance.paraElSolicitante(req, transportistas);
  }

  @Pantalla('empleado_transportista', 'turnos', 'retiros', 'hoja_ruta')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado transportista por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'transportistas', +id);
    return this.alcance.paraElSolicitante(req, await this.empleadoTransportistaService.findOne(+id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado transportista' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmpleadoTransportistaDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'transportistas', +id);
    return this.empleadoTransportistaService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado transportista (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'transportistas', +id);
    return this.empleadoTransportistaService.remove(+id);
  }
}
