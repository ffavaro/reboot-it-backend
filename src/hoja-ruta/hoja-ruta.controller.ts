import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HojaRutaService } from './hoja-ruta.service';
import {
  DiaHojaRutaQueryDto,
  GenerarHojaRutaDto,
  HistoricoHojaRutaQueryDto,
} from './dto/hoja-ruta.dto';
import { Pantalla, Accion } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('hoja_ruta')
@ApiTags('hojas-ruta')
@Controller('hojas-ruta')
export class HojaRutaController {
  // Si pide la hoja de otro transportista se rechaza; si no indica ninguno se usa el propio
  private propio(propioId: number | null, pedido?: number) {
    if (propioId === null || (pedido !== undefined && pedido !== propioId)) {
      throw new ForbiddenException('Solo podés operar sobre tus propios registros.');
    }
    return propioId;
  }

  constructor(
    private readonly hojaRutaService: HojaRutaService,
    private readonly ambito: AmbitoService,
  ) {}

  @Get('dia')
  @ApiOperation({
    summary: 'Hojas de ruta de un rango de fechas (por defecto hoy): pedidos asignados, ruta optimizada y km estimados por transportista y día',
  })
  async getDia(@Query() query: DiaHojaRutaQueryDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    // quien ve solo lo asignado consulta únicamente su propia hoja
    if (a) query.empleadoTransportistaId = this.propio(a.transportistaId, query.empleadoTransportistaId);
    return this.hojaRutaService.getDia(query);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Hojas de ruta finalizadas, filtrables por fecha, transportista y vehículo' })
  async historico(@Query() query: HistoricoHojaRutaQueryDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    if (a) query.empleadoTransportistaId = this.propio(a.transportistaId, query.empleadoTransportistaId);
    return this.hojaRutaService.historico(query);
  }

  // Generar la hoja de ruta es del Administrativo (permiso de crear sobre Hoja de ruta); el transportista la recibe y confirma sus retiros
  @Accion('crear')
  @Post('generar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Genera la hoja de ruta de una fecha con los turnos pendientes de retiro: queda En proceso y registra el km inicial y estimado en el historial del vehículo',
  })
  async generar(@Body() dto: GenerarHojaRutaDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'transportistas', dto.empleadoTransportistaId);
    return this.hojaRutaService.generar(dto.empleadoTransportistaId, dto.fecha, dto.confirmar);
  }

  @Accion('editar')
  @Post('turnos/:turnoId/confirmar-retiro')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirma el retiro de un turno de la hoja (finaliza el turno y genera la constancia de retiro); al confirmar el último turno pendiente, finaliza la hoja con los km estimados',
  })
  async confirmarRetiro(@Param('turnoId', ParseIdPipe) turnoId: number, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', turnoId);
    return this.hojaRutaService.confirmarRetiro(turnoId);
  }

  @Get('turnos/:turnoId/constancia')
  @ApiOperation({ summary: 'Datos de la constancia de retiro de un turno (para verla y descargarla en PDF)' })
  async constancia(@Param('turnoId', ParseIdPipe) turnoId: number, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'turnos', turnoId);
    return this.hojaRutaService.constanciaDeTurno(turnoId);
  }
}
