import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegistroFotograficoService } from './registro-fotografico.service';
import { CreateRegistroFotograficoDto } from './dto/create-registro-fotografico.dto';
import { UpdateRegistroFotograficoDto } from './dto/update-registro-fotografico.dto';
import { Pantalla, Accion, Authenticated } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('registro_fotografico')
@ApiTags('registro-fotografico')
@Controller('registro-fotografico')
export class RegistroFotograficoController {
  constructor(
    private readonly registroFotograficoService: RegistroFotograficoService,
    private readonly ambito: AmbitoService,
  ) {}

  // El transportista sube las fotos al confirmar el retiro desde su hoja de ruta, sin tener la pantalla Registro fotográfico
  @Pantalla('registro_fotografico', 'hoja_ruta')
  @Accion('editar')
  @Post()
  @ApiOperation({ summary: 'Crear un registro fotográfico' })
  async create(@Body() dto: CreateRegistroFotograficoDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    if (a) {
      // la foto tiene que estar asociada a un lote o a un turno propios
      if (dto.loteId === undefined && dto.turnoId === undefined) this.ambito.exigir(a, 'lotes', null);
      if (dto.loteId !== undefined) this.ambito.exigir(a, 'lotes', dto.loteId);
      if (dto.turnoId !== undefined) this.ambito.exigir(a, 'turnos', dto.turnoId);
    }
    return this.registroFotograficoService.create(dto);
  }

  @Pantalla('registro_fotografico', 'lotes')
  @Get()
  @ApiOperation({ summary: 'Listar todos los registros fotográficos activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['registro_fotografico']);
    const lista = await this.registroFotograficoService.findAll();
    return a ? lista.filter((x) => (!!x.loteId && a.lotes.has(x.loteId)) || (!!x.turnoId && a.turnos.has(x.turnoId))) : lista;
  }

  @Pantalla('registro_fotografico', 'turnos')
  @Get('by-turno/:turnoId')
  @ApiOperation({ summary: 'Listar registros fotográficos de un turno' })
  async findByTurno(@Param('turnoId') turnoId: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req, ['registro_fotografico']), 'turnos', +turnoId);
    return this.registroFotograficoService.findByTurno(+turnoId);
  }

  @Pantalla('registro_fotografico', 'lotes')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro fotográfico por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['registro_fotografico']);
    const foto = await this.registroFotograficoService.findOne(+id);
    if (a && !((!!foto.loteId && a.lotes.has(foto.loteId)) || (!!foto.turnoId && a.turnos.has(foto.turnoId)))) {
      this.ambito.exigir(a, 'lotes', null);
    }
    return foto;
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
