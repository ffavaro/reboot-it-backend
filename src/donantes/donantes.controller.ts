import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { Pantalla, Authenticated, ROL_ID_DONANTE } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { PermisosService } from '../permisos/permisos.service';

@Pantalla('donantes')
@ApiTags('donantes')
@Controller('donantes')
export class DonantesController {
  constructor(
    private readonly donantesService: DonantesService,
    private readonly permisos: PermisosService,
  ) {}

  // Quien se registra (rol Donante) crea su propio donante; para el resto se exige el permiso de crear en Donantes
  @Authenticated()
  @Post()
  @ApiOperation({ summary: 'Crear un donante' })
  async create(@Body() dto: CreateDonanteDto, @Req() req: RequestConUsuario) {
    if (req.user?.rolId === ROL_ID_DONANTE) {
      if (dto.usuario || dto.usuarioId !== req.user.id) {
        throw new ForbiddenException('Solo podés crear el donante asociado a tu propio usuario.');
      }
    } else {
      await this.permisos.exigir(req.user?.rolId, ['donantes'], 'crear');
    }
    return this.donantesService.create(dto);
  }

  @Authenticated()
  @Get()
  @ApiOperation({ summary: 'Listar todos los donantes activos' })
  findAll() {
    return this.donantesService.findAll();
  }

  @Authenticated()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un donante por ID' })
  findOne(@Param('id') id: string) {
    return this.donantesService.findOne(+id);
  }

  @Pantalla('donantes', 'mi_perfil')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un donante' })
  update(@Param('id') id: string, @Body() dto: UpdateDonanteDto) {
    return this.donantesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un donante (soft delete)' })
  remove(@Param('id') id: string) {
    return this.donantesService.remove(+id);
  }
}
