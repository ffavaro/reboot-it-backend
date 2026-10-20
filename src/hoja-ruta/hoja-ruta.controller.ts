import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HojaRutaService } from './hoja-ruta.service';
import {
  DiaHojaRutaQueryDto,
  FinalizarHojaRutaDto,
  HistoricoHojaRutaQueryDto,
  IniciarHojaRutaDto,
} from './dto/hoja-ruta.dto';

@ApiTags('hojas-ruta')
@Controller('hojas-ruta')
export class HojaRutaController {
  constructor(private readonly hojaRutaService: HojaRutaService) {}

  @Get('dia')
  @ApiOperation({
    summary: 'Hojas de ruta de un rango de fechas (por defecto hoy): pedidos asignados, ruta optimizada y km estimados por transportista y día',
  })
  getDia(@Query() query: DiaHojaRutaQueryDto) {
    return this.hojaRutaService.getDia(query);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Hojas de ruta finalizadas, filtrables por fecha, transportista y vehículo' })
  historico(@Query() query: HistoricoHojaRutaQueryDto) {
    return this.hojaRutaService.historico(query);
  }

  @Post('iniciar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pendiente -> En proceso: registra el km inicial del vehículo en el historial' })
  iniciar(@Body() dto: IniciarHojaRutaDto) {
    return this.hojaRutaService.iniciar(dto.empleadoTransportistaId);
  }

  @Post(':id/finalizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'En proceso -> Finalizada: carga el km final y actualiza el km actual del vehículo' })
  finalizar(@Param('id', ParseIdPipe) id: number, @Body() dto: FinalizarHojaRutaDto) {
    return this.hojaRutaService.finalizar(id, dto);
  }
}
