import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmpleadoTransportistaService } from './empleado-transportista.service';
import { CreateEmpleadoTransportistaDto } from './dto/create-empleado-transportista.dto';
import { UpdateEmpleadoTransportistaDto } from './dto/update-empleado-transportista.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';
import { ocultarDatosPrivadosDelTransportista } from '../common/ocultar-datos-transportista';

@Pantalla('empleado_transportista')
@ApiTags('empleado-transportista')
@Controller('empleado-transportista')
export class EmpleadoTransportistaController {
  constructor(
    private readonly empleadoTransportistaService: EmpleadoTransportistaService,
    private readonly ambito: AmbitoService,
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
    const a = await this.ambito.de(req, ['empleado_transportista', 'turnos', 'retiros', 'hoja_ruta']);
    const lista = await this.empleadoTransportistaService.findAll();
    const visibles = a ? lista.filter((x) => a.transportistas.has(x.id)) : lista;
    return a?.donanteId != null ? ocultarDatosPrivadosDelTransportista(visibles) : visibles;
  }

  @Pantalla('empleado_transportista', 'turnos', 'retiros', 'hoja_ruta')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado transportista por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req, ['empleado_transportista', 'turnos', 'retiros', 'hoja_ruta']), 'transportistas', +id);
    return this.empleadoTransportistaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado transportista' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmpleadoTransportistaDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'transportistas', +id);
    return this.empleadoTransportistaService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado transportista (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'transportistas', +id);
    return this.empleadoTransportistaService.remove(+id);
  }
}
