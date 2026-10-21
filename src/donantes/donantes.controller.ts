import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { Pantalla, Authenticated, ROL_ID_DONANTE } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { PermisosService } from '../permisos/permisos.service';
import { AmbitoService } from '../permisos/ambito.service';
import { Donante } from './donante.entity';

// Pantallas que muestran donantes (nombre del donante en la grilla o en un combo)
const PANTALLAS_CONSULTA_DONANTES = [
  'donantes', 'donaciones', 'turnos', 'certificado_disposicion', 'constancia_retiro', 'dashboard+',
  'reporte_donaciones', 'reporte_retiros', 'usuarios',
];

const resumenDonante = (d: Donante) => ({
  id: d.id, nombre: d.nombre, razonSocial: d.razonSocial, tipoDonanteId: d.tipoDonanteId, tipoDonante: d.tipoDonante, isActive: d.isActive,
});

@Pantalla('donantes')
@ApiTags('donantes')
@Controller('donantes')
export class DonantesController {
  constructor(
    private readonly donantesService: DonantesService,
    private readonly permisos: PermisosService,
    private readonly ambito: AmbitoService,
  ) {}

  // Quien consulta donantes sin tener la pantalla Donantes (solo como combo de otra pantalla) ve únicamente el nombre y el tipo:
  // el teléfono, la dirección y el vínculo con el usuario son datos personales
  private async soloNombre(req: RequestConUsuario, ambito: unknown) {
    return !ambito && (await this.permisos.alcance(req.user?.rolId, ['donantes'], 'ver')) === 'NINGUNO';
  }

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

  @Pantalla(...PANTALLAS_CONSULTA_DONANTES)
  @Get()
  @ApiOperation({ summary: 'Listar todos los donantes activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['donantes']);
    const lista = await this.donantesService.findAll();
    const visibles = a ? lista.filter((d) => a.donantes.has(d.id)) : lista;
    return (await this.soloNombre(req, a)) ? visibles.map(resumenDonante) : visibles;
  }

  @Pantalla(...PANTALLAS_CONSULTA_DONANTES)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un donante por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req, ['donantes']);
    this.ambito.exigir(a, 'donantes', +id);
    const donante = await this.donantesService.findOne(+id);
    return (await this.soloNombre(req, a)) ? resumenDonante(donante) : donante;
  }

  @Pantalla('donantes', 'mi_perfil')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un donante' })
  async update(@Param('id') id: string, @Body() dto: UpdateDonanteDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'donantes', +id);
    // quien solo ve lo propio no puede reasignar el usuario al que está vinculado el donante
    if (req.permiso?.alcance === 'PROPIO' && dto.usuarioId !== undefined) {
      throw new ForbiddenException('No podés cambiar el usuario vinculado al donante.');
    }
    return this.donantesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un donante (soft delete)' })
  remove(@Param('id') id: string) {
    return this.donantesService.remove(+id);
  }
}
