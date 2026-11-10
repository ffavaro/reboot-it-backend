import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { HistorialKmVehiculoService } from './historial-km-vehiculo.service';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';
import { RangoFechasDto, ReporteUsoDto } from './dto/rango-fechas.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('vehiculos')
@Controller('historial-km-vehiculo')
export class HistorialKmVehiculoController {
  constructor(
    private readonly historialKmVehiculoService: HistorialKmVehiculoService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  async create(@Body() createHistorialKmVehiculoDto: CreateHistorialKmVehiculoDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'vehiculos', createHistorialKmVehiculoDto.vehiculoId);
    return this.historialKmVehiculoService.create(createHistorialKmVehiculoDto);
  }

  @Get()
  findAll(@Req() req: RequestConUsuario) {
    return this.historialKmVehiculoService.findAll(this.alcance.condicion(req, 'historialKm'));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'historialKm', +id);
    return this.historialKmVehiculoService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHistorialKmVehiculoDto: UpdateHistorialKmVehiculoDto,
    @Req() req: RequestConUsuario,
  ) {
    await this.alcance.exigir(req, 'historialKm', +id);
    return this.historialKmVehiculoService.update(+id, updateHistorialKmVehiculoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'historialKm', +id);
    return this.historialKmVehiculoService.remove(+id);
  }

  @Pantalla('dashboard', 'vehiculos')
  @Get('reporte/uso')
  reporteUso(@Query() query: ReporteUsoDto) {
    return this.historialKmVehiculoService.reporteUso(query);
  }

  @Get('vehiculo/:vehiculoId')
  async historialDeVehiculo(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Query() rango: RangoFechasDto,
    @Req() req: RequestConUsuario,
  ) {
    await this.alcance.exigir(req, 'vehiculos', vehiculoId);
    return this.historialKmVehiculoService.historialDeVehiculo(vehiculoId, rango);
  }
}
