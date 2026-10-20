import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RetiroService } from './retiro.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { ReporteRetiroDto } from './dto/reporte-retiro.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('retiros')
@ApiTags('retiro')
@Controller('retiro')
export class RetiroController {
  constructor(
    private readonly retiroService: RetiroService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un retiro' })
  create(@Body() dto: CreateRetiroDto) {
    return this.retiroService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los retiros activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const planta = await this.ambito.enPlanta(req);
    const lista = await this.retiroService.findAll();
    return lista.filter((x) => (!a || a.retiros.has(x.id)) && (!planta || planta.has(x.donacionId)));
  }

  @Pantalla('reporte_retiros')
  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de retiros a domicilio con filtros' })
  reporte(@Query() query: ReporteRetiroDto) {
    return this.retiroService.reporte(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un retiro por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'retiros', +id);
    const retiro = await this.retiroService.findOne(+id);
    this.ambito.exigirEnPlanta(await this.ambito.enPlanta(req), retiro.donacionId);
    return retiro;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un retiro' })
  async update(@Param('id') id: string, @Body() dto: UpdateRetiroDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'retiros', +id);
    return this.retiroService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un retiro (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'retiros', +id);
    return this.retiroService.remove(+id);
  }
}
