import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TurnoService } from './turno.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { AsignarEmpleadoDto } from './dto/asignar-empleado.dto';
import { Pantalla, Authenticated } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';
import { ocultarDatosPrivadosDelTransportista } from '../common/ocultar-datos-transportista';

@Pantalla('turnos')
@ApiTags('turno')
@Controller('turno')
export class TurnoController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un turno' })
  async create(@Body() dto: CreateTurnoDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'donantes', dto.donanteId);
    return this.turnoService.create(dto);
  }

  @Pantalla('turnos', 'agenda', 'donaciones', 'retiros')
  @Get()
  @ApiOperation({ summary: 'Listar todos los turnos activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['turnos', 'agenda']);
    const lista = await this.turnoService.findAll();
    const visibles = a ? lista.filter((x) => a.turnos.has(x.id)) : lista;
    return a?.donanteId != null ? ocultarDatosPrivadosDelTransportista(visibles) : visibles;
  }

  @Pantalla('turnos', 'agenda', 'donaciones', 'retiros')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un turno por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['turnos', 'agenda']);
    this.ambito.exigir(a, 'turnos', +id);
    const turno = await this.turnoService.findOne(+id);
    return a?.donanteId != null ? ocultarDatosPrivadosDelTransportista(turno) : turno;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un turno' })
  async update(@Param('id') id: string, @Body() dto: UpdateTurnoDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', +id);
    if (req.permiso?.alcance === 'LIMITADO') await this.turnoService.validarCambioDelDonante(+id, dto.fechaHora);
    return this.turnoService.update(+id, dto);
  }

  // Operaciones del equipo: no las puede ejecutar quien tiene acceso limitado a Turnos (el donante que reprograma o cancela)
  @Pantalla('turnos!')
  @Patch(':id/asignar')
  @ApiOperation({ summary: 'Asignar empleado al turno y pasar a estado Asignado' })
  async asignarEmpleado(@Param('id') id: string, @Body() dto: AsignarEmpleadoDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', +id);
    return this.turnoService.asignarEmpleado(+id, dto);
  }

  @Pantalla('turnos!')
  @Patch(':id/confirmar-recepcion')
  @ApiOperation({ summary: 'Turno de sucursal: pasa de Asignado a Retiro confirmado para poder clasificar los materiales' })
  async confirmarRecepcion(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', +id);
    return this.turnoService.confirmarRecepcion(+id);
  }

  @Pantalla('turnos!')
  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar un turno (requiere al menos una foto registrada)' })
  async finalizar(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', +id);
    return this.turnoService.finalizarTurno(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un turno (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', +id);
    if (req.permiso?.alcance === 'LIMITADO') await this.turnoService.validarCambioDelDonante(+id);
    return this.turnoService.remove(+id);
  }
}
