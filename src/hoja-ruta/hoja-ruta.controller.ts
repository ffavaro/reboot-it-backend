import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ConsultaHojaRutaDto,
  GenerarHojaRutaDto,
  HistoricoHojaRutaDto,
} from './dto/hoja-ruta.dto';
import { HojaRutaConsultaService } from './hoja-ruta-consulta.service';
import { HojaRutaService } from './hoja-ruta.service';
import { Pantalla } from '../auth/permisos.decorators';

@Pantalla('hoja_ruta')
@ApiTags('hojas-ruta')
@Controller('hojas-ruta')
export class HojaRutaController {
  constructor(
    private readonly hojaRutaService: HojaRutaService,
    private readonly consulta: HojaRutaConsultaService,
  ) {}

  @Get('dia')
  @ApiOperation({
    summary:
      'Hojas de ruta por transportista y día en un rango de fechas (por defecto hoy)',
  })
  dia(@Query() query: ConsultaHojaRutaDto) {
    return this.consulta.consultar(query);
  }

  @Get('historico')
  @ApiOperation({
    summary: 'Hojas de ruta finalizadas con km estimados y reales',
  })
  historico(@Query() query: HistoricoHojaRutaDto) {
    return this.consulta.historico(query);
  }

  @Post('generar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Genera la hoja de ruta de una fecha y registra el km inicial y estimado del vehículo',
  })
  generar(@Body() dto: GenerarHojaRutaDto) {
    return this.hojaRutaService.generar(
      dto.empleadoTransportistaId,
      dto.fecha,
      dto.confirmar,
    );
  }

  @Post('turnos/:turnoId/confirmar-retiro')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Confirma el retiro de un turno y emite su constancia; con el último retiro la hoja se finaliza',
  })
  confirmarRetiro(@Param('turnoId', ParseIntPipe) turnoId: number) {
    return this.hojaRutaService.confirmarRetiro(turnoId);
  }

  @Get('turnos/:turnoId/constancia')
  @ApiOperation({ summary: 'Constancia de retiro de un turno' })
  constancia(@Param('turnoId', ParseIntPipe) turnoId: number) {
    return this.hojaRutaService.constanciaDeTurno(turnoId);
  }
}
