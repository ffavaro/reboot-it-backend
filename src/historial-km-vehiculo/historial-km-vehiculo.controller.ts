import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseDatePipe } from '@nestjs/common';
import { HistorialKmVehiculoService } from './historial-km-vehiculo.service';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';
import { RangoFechasDto, ReporteUsoDto } from './dto/rango-fechas.dto';
import { Pantalla } from '../auth/permisos.decorators';

@Pantalla('vehiculos')
@Controller('historial-km-vehiculo')
export class HistorialKmVehiculoController {
  constructor(private readonly historialKmVehiculoService: HistorialKmVehiculoService) { }

  @Post()
  create(@Body() createHistorialKmVehiculoDto: CreateHistorialKmVehiculoDto) {
    return this.historialKmVehiculoService.create(createHistorialKmVehiculoDto);
  }

  @Get()
  findAll() {
    return this.historialKmVehiculoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialKmVehiculoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialKmVehiculoDto: UpdateHistorialKmVehiculoDto) {
    return this.historialKmVehiculoService.update(+id, updateHistorialKmVehiculoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialKmVehiculoService.remove(+id);
  }

    @Get('reporte/uso')
  reporteUso(@Query() query: ReporteUsoDto) {
    return this.historialKmVehiculoService.reporteUso(query);
  }

  @Get('vehiculo/:vehiculoId')
  historialDeVehiculo(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Query() rango: RangoFechasDto,
  ) {
    return this.historialKmVehiculoService.historialDeVehiculo(vehiculoId, rango);
  }
}
