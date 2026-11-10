import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConsultaHojaRutaDto, GenerarHojaRutaDto, HistoricoHojaRutaDto } from './dto/hoja-ruta.dto';
import { HojaRutaConsultaService } from './hoja-ruta-consulta.service';
import { HojaRutaService } from './hoja-ruta.service';
import { Accion, Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('hoja_ruta')
@ApiTags('hojas-ruta')
@Controller('hojas-ruta')
export class HojaRutaController {
  constructor(
    private readonly hojaRutaService: HojaRutaService,
    private readonly consulta: HojaRutaConsultaService,
    private readonly alcance: AlcanceService,
  ) {}

  @Get('dia')
  @ApiOperation({ summary: 'Hojas de ruta por transportista y día en un rango de fechas (por defecto hoy)' })
  async dia(@Query() query: ConsultaHojaRutaDto, @Req() req: RequestConUsuario) {
    if (!this.alcance.esTotal(req)) query.empleadoTransportistaId = await this.alcance.transportistaId(req);
    return this.consulta.consultar(query);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Hojas de ruta finalizadas con km estimados y reales' })
  async historico(@Query() query: HistoricoHojaRutaDto, @Req() req: RequestConUsuario) {
    if (!this.alcance.esTotal(req)) query.empleadoTransportistaId = await this.alcance.transportistaId(req);
    return this.consulta.historico(query);
  }

  @Post('generar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Genera la hoja de ruta de una fecha y registra el km inicial y estimado del vehículo' })
  async generar(@Body() dto: GenerarHojaRutaDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'transportistas', dto.empleadoTransportistaId);
    return this.hojaRutaService.generar(dto.empleadoTransportistaId, dto.fecha, dto.confirmar);
  }

  @Accion('editar')
  @Post('turnos/:turnoId/confirmar-retiro')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirma el retiro de un turno y emite su constancia; con el último retiro la hoja se finaliza' })
  async confirmarRetiro(@Param('turnoId', ParseIntPipe) turnoId: number, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'turnos', turnoId);
    return this.hojaRutaService.confirmarRetiro(turnoId);
  }

  @Get('turnos/:turnoId/constancia')
  @ApiOperation({ summary: 'Constancia de retiro de un turno' })
  async constancia(@Param('turnoId', ParseIntPipe) turnoId: number, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'turnos', turnoId);
    return this.hojaRutaService.constanciaDeTurno(turnoId);
  }
}
