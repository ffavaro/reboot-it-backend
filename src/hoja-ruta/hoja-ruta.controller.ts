import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HojaRutaService } from './hoja-ruta.service';
import {
  DiaHojaRutaQueryDto,
  FinalizarHojaRutaDto,
  HistoricoHojaRutaQueryDto,
  IniciarHojaRutaDto,
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

  @Accion('editar')
  @Post('iniciar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pendiente -> En proceso: registra el km inicial del vehículo en el historial' })
  async iniciar(@Body() dto: IniciarHojaRutaDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'transportistas', dto.empleadoTransportistaId);
    return this.hojaRutaService.iniciar(dto.empleadoTransportistaId);
  }

  @Accion('editar')
  @Post(':id/finalizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'En proceso -> Finalizada: carga el km final y actualiza el km actual del vehículo' })
  async finalizar(@Param('id', ParseIdPipe) id: number, @Body() dto: FinalizarHojaRutaDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    if (a) this.ambito.exigir(a, 'transportistas', await this.hojaRutaService.transportistaDe(id));
    return this.hojaRutaService.finalizar(id, dto);
  }
}
