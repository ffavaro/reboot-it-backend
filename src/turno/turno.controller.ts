import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TurnoService } from './turno.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { AsignarEmpleadoDto } from './dto/asignar-empleado.dto';
import { Pantalla, SoloAlcanceTotal } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('turnos')
@ApiTags('turno')
@Controller('turno')
export class TurnoController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un turno' })
  async create(@Body() dto: CreateTurnoDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donantes', dto.donanteId);
    return this.turnoService.create(dto);
  }

  @Pantalla('turnos', 'agenda', 'donaciones', 'retiros')
  @Get()
  @ApiOperation({ summary: 'Listar todos los turnos activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const turnos = await this.turnoService.findAll(this.alcance.condicion(req, 'turnos'));
    return this.alcance.paraElSolicitante(req, turnos);
  }

  @Pantalla('turnos', 'agenda', 'donaciones', 'retiros')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un turno por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'turnos', +id);
    return this.alcance.paraElSolicitante(req, await this.turnoService.findOne(+id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un turno' })
  async update(@Param('id') id: string, @Body() dto: UpdateTurnoDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'turnos', +id);
    return this.turnoService.update(+id, dto);
  }

  @SoloAlcanceTotal()
  @Patch(':id/asignar')
  @ApiOperation({ summary: 'Asignar empleado al turno y pasar a estado Asignado' })
  asignarEmpleado(@Param('id') id: string, @Body() dto: AsignarEmpleadoDto) {
    return this.turnoService.asignarEmpleado(+id, dto);
  }

  @SoloAlcanceTotal()
  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar un turno (requiere al menos una foto registrada)' })
  finalizar(@Param('id') id: string) {
    return this.turnoService.finalizarTurno(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un turno (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'turnos', +id);
    return this.turnoService.remove(+id);
  }
}
