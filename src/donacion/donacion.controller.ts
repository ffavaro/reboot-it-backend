import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonacionService } from './donacion.service';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { ReporteDonacionDto } from './dto/reporte-donacion.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('donaciones')
@ApiTags('donacion')
@Controller('donacion')
export class DonacionController {
  constructor(
    private readonly donacionService: DonacionService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una donación' })
  async create(@Body() dto: CreateDonacionDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'donantes', dto.donanteId);
    return this.donacionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las donaciones activas' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const lista = await this.donacionService.findAll();
    return a ? lista.filter((x) => a.donaciones.has(x.id)) : lista;
  }

  @Pantalla('reporte_donaciones', 'dashboard+')
  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de donaciones con filtros' })
  reporte(@Query() query: ReporteDonacionDto) {
    return this.donacionService.reporte(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una donación por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'donaciones', +id);
    return this.donacionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una donación' })
  async update(@Param('id') id: string, @Body() dto: UpdateDonacionDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'donaciones', +id);
    if (dto.donanteId !== undefined) this.ambito.exigir(a, 'donantes', dto.donanteId);
    return this.donacionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una donación (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'donaciones', +id);
    return this.donacionService.remove(+id);
  }
}
