import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonacionService } from './donacion.service';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { ReporteDonacionDto } from './dto/reporte-donacion.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('donaciones')
@ApiTags('donacion')
@Controller('donacion')
export class DonacionController {
  constructor(
    private readonly donacionService: DonacionService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una donación' })
  async create(@Body() dto: CreateDonacionDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donantes', dto.donanteId);
    return this.donacionService.create(dto);
  }

  @Pantalla('donaciones', 'lotes', 'turnos', 'agenda', 'constancia_retiro', 'retiros')
  @Get()
  @ApiOperation({ summary: 'Listar todas las donaciones activas' })
  async findAll(@Req() req: RequestConUsuario) {
    const donaciones = await this.donacionService.findAll(this.alcance.condicion(req, 'donaciones'));
    return this.alcance.paraElSolicitante(req, donaciones);
  }

  @Pantalla('reporte_donaciones', 'dashboard')
  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de donaciones con filtros' })
  reporte(@Query() query: ReporteDonacionDto) {
    return this.donacionService.reporte(query);
  }

  @Get(':id/detalle')
  @ApiOperation({ summary: 'Recorrido completo de una donación: materiales, turno, fotos, retiro, constancia, lote y certificado' })
  async trazabilidad(@Param('id', ParseIntPipe) id: number, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donaciones', id);
    return this.alcance.paraElSolicitante(req, await this.donacionService.trazabilidad(id));
  }

  @Pantalla('donaciones', 'lotes', 'turnos', 'agenda', 'constancia_retiro', 'retiros')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una donación por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donaciones', +id);
    return this.alcance.paraElSolicitante(req, await this.donacionService.findOne(+id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una donación' })
  async update(@Param('id') id: string, @Body() dto: UpdateDonacionDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donaciones', +id);
    if (dto.donanteId !== undefined) await this.alcance.exigir(req, 'donantes', dto.donanteId);
    return this.donacionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una donación (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'donaciones', +id);
    return this.donacionService.remove(+id);
  }
}
