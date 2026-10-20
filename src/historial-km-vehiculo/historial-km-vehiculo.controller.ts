import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
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
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('vehiculos')
@ApiTags('historial-km-vehiculo')
@Controller('historial-km-vehiculo')
export class HistorialKmVehiculoController {
  constructor(
    private readonly historialService: HistorialKmVehiculoService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un recorrido (km inicial, y opcionalmente final)' })
  async create(@Body() dto: CreateHistorialKmVehiculoDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'vehiculos', dto.vehiculoId);
    return this.historialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar el historial de km, con filtros opcionales por vehículo y fechas' })
  async findAll(@Query() query: ListarHistorialQueryDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    if (a && query.vehiculoId !== undefined) this.ambito.exigir(a, 'vehiculos', query.vehiculoId);
    const lista = await this.historialService.findAll(query.vehiculoId, query);
    return a ? lista.filter((x) => a.vehiculos.has(x.vehiculoId)) : lista;
  }

  @Pantalla('dashboard+', 'vehiculos')
  @Get('reporte/uso')
  @ApiOperation({ summary: 'Vehículos más utilizados: km totales y recorridos finalizados por vehículo en el período' })
  reporteUso(@Query() query: ReporteUsoVehiculosQueryDto) {
    return this.historialService.reporteUso(query, query.limit);
  }

  @Get('vehiculo/:vehiculoId')
  @ApiOperation({ summary: 'Listar el historial de km de un vehículo (filtrable por fechas)' })
  async findByVehiculo(@Param('vehiculoId', ParseIdPipe) vehiculoId: number, @Query() query: RangoFechasQueryDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'vehiculos', vehiculoId);
    return this.historialService.findByVehiculo(vehiculoId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro del historial por ID' })
  async findOne(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const h = await this.historialService.findOne(id);
    this.ambito.exigir(a, 'vehiculos', h.vehiculoId);
    return h;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro del historial' })
  async update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateHistorialKmVehiculoDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'vehiculos', (await this.historialService.findOne(id)).vehiculoId);
    return this.historialService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro del historial' })
  async remove(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'vehiculos', (await this.historialService.findOne(id)).vehiculoId);
    return this.historialService.remove(id);
  }
}
