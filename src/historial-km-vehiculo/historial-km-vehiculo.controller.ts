import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HistorialKmVehiculoService } from './historial-km-vehiculo.service';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';
import {
  ListarHistorialQueryDto,
  RangoFechasQueryDto,
  ReporteUsoVehiculosQueryDto,
} from './dto/rango-fechas-query.dto';

@ApiTags('historial-km-vehiculo')
@Controller('historial-km-vehiculo')
export class HistorialKmVehiculoController {
  constructor(private readonly historialService: HistorialKmVehiculoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un recorrido (km inicial, y opcionalmente final)' })
  create(@Body() dto: CreateHistorialKmVehiculoDto) {
    return this.historialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar el historial de km, con filtros opcionales por vehículo y fechas' })
  findAll(@Query() query: ListarHistorialQueryDto) {
    return this.historialService.findAll(query.vehiculoId, query);
  }

  @Get('reporte/uso')
  @ApiOperation({ summary: 'Vehículos más utilizados: km totales y recorridos finalizados por vehículo en el período' })
  reporteUso(@Query() query: ReporteUsoVehiculosQueryDto) {
    return this.historialService.reporteUso(query, query.limit);
  }

  @Get('vehiculo/:vehiculoId')
  @ApiOperation({ summary: 'Listar el historial de km de un vehículo (filtrable por fechas)' })
  findByVehiculo(@Param('vehiculoId', ParseIdPipe) vehiculoId: number, @Query() query: RangoFechasQueryDto) {
    return this.historialService.findByVehiculo(vehiculoId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro del historial por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.historialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro del historial' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateHistorialKmVehiculoDto) {
    return this.historialService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro del historial' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.historialService.remove(id);
  }
}
