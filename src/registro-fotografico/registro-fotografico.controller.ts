import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegistroFotograficoService } from './registro-fotografico.service';
import { CreateRegistroFotograficoDto } from './dto/create-registro-fotografico.dto';
import { UpdateRegistroFotograficoDto } from './dto/update-registro-fotografico.dto';
import { Accion, Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('registro_fotografico')
@ApiTags('registro-fotografico')
@Controller('registro-fotografico')
export class RegistroFotograficoController {
  constructor(
    private readonly registroFotograficoService: RegistroFotograficoService,
    private readonly alcance: AlcanceService,
  ) {}

  @Pantalla('registro_fotografico', 'hoja_ruta')
  @Accion('editar')
  @Post()
  @ApiOperation({ summary: 'Crear un registro fotográfico' })
  async create(@Body() dto: CreateRegistroFotograficoDto, @Req() req: RequestConUsuario) {
    if (!this.alcance.esTotal(req)) {
      if (dto.loteId == null && dto.turnoId == null) {
        throw new ForbiddenException('Indicá el lote o el turno al que pertenece la foto.');
      }
      if (dto.loteId != null) await this.alcance.exigir(req, 'lotes', dto.loteId);
      if (dto.turnoId != null) await this.alcance.exigir(req, 'turnos', dto.turnoId);
    }
    return this.registroFotograficoService.create(dto);
  }

  @Pantalla('registro_fotografico', 'lotes')
  @Get()
  @ApiOperation({ summary: 'Listar todos los registros fotográficos activos' })
  findAll(@Req() req: RequestConUsuario) {
    return this.registroFotograficoService.findAll(this.alcance.condicion(req, 'fotos'));
  }

  @Pantalla('registro_fotografico', 'turnos')
  @Get('by-turno/:turnoId')
  @ApiOperation({ summary: 'Listar registros fotográficos de un turno' })
  async findByTurno(@Param('turnoId') turnoId: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'turnos', +turnoId);
    return this.registroFotograficoService.findByTurno(+turnoId);
  }

  @Pantalla('registro_fotografico', 'lotes')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro fotográfico por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'fotos', +id);
    return this.registroFotograficoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro fotográfico' })
  update(@Param('id') id: string, @Body() dto: UpdateRegistroFotograficoDto) {
    return this.registroFotograficoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un registro fotográfico (soft delete)' })
  remove(@Param('id') id: string) {
    return this.registroFotograficoService.remove(+id);
  }
}
