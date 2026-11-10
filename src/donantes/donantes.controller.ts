import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('donantes')
@ApiTags('donantes')
@Controller('donantes')
export class DonantesController {
  constructor(
    private readonly donantesService: DonantesService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un donante' })
  create(@Body() dto: CreateDonanteDto) {
    return this.donantesService.create(dto);
  }

  @Pantalla('donantes', 'donaciones', 'turnos', 'agenda', 'retiros', 'lotes', 'certificado_disposicion')
  @Get()
  @ApiOperation({ summary: 'Listar todos los donantes activos' })
  findAll(@Req() req: RequestConUsuario) {
    return this.donantesService.findAll(this.alcance.condicion(req, 'donantes'));
  }

  @Pantalla('donantes', 'donaciones', 'turnos', 'agenda', 'retiros', 'lotes', 'certificado_disposicion', 'mi_perfil')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un donante por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donantes', +id);
    return this.donantesService.findOne(+id);
  }

  @Pantalla('donantes', 'mi_perfil')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un donante' })
  async update(@Param('id') id: string, @Body() dto: UpdateDonanteDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donantes', +id);
    if (this.alcance.esPropio(req) && dto.usuarioId !== undefined) {
      throw new ForbiddenException('No podés cambiar el usuario vinculado a tu perfil.');
    }
    return this.donantesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un donante (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donantes', +id);
    return this.donantesService.remove(+id);
  }
}
