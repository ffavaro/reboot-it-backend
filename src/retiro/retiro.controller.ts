import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RetiroService } from './retiro.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { ReporteRetiroDto } from './dto/reporte-retiro.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';
import { ocultarDatosPrivadosDelTransportista } from '../common/ocultar-datos-transportista';

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

  @Pantalla('retiros', 'constancia_retiro')
  @Get()
  @ApiOperation({ summary: 'Listar todos los retiros activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    // la regla de planta es de la pantalla Retiros (no de Constancias, que también usa este listado)
    const planta = await this.ambito.enPlanta(req, ['retiros']);
    const lista = await this.retiroService.findAll();
    const visibles = lista.filter((x) => (!a || a.retiros.has(x.id)) && (!planta || planta.has(x.donacionId)));
    return a?.donanteId != null ? ocultarDatosPrivadosDelTransportista(visibles) : visibles;
  }

  @Pantalla('reporte_retiros')
  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de retiros a domicilio con filtros' })
  reporte(@Query() query: ReporteRetiroDto) {
    return this.retiroService.reporte(query);
  }

  @Pantalla('retiros', 'constancia_retiro')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un retiro por ID' })
  async findOne(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'retiros', +id);
    const retiro = await this.retiroService.findOne(+id);
    this.ambito.exigirEnPlanta(await this.ambito.enPlanta(req, ['retiros']), retiro.donacionId);
    return a?.donanteId != null ? ocultarDatosPrivadosDelTransportista(retiro) : retiro;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un retiro' })
  async update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateRetiroDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'retiros', +id);
    return this.retiroService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un retiro (soft delete)' })
  async remove(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'retiros', +id);
    return this.retiroService.remove(+id);
  }
}
