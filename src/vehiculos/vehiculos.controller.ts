import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Pantalla, SoloAlcanceTotal } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('vehiculos')
@ApiTags('vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(
    private readonly vehiculosService: VehiculosService,
    private readonly alcance: AlcanceService,
  ) {}

  @SoloAlcanceTotal()
  @Post()
  @ApiOperation({ summary: 'Crear un vehículo' })
  create(@Body() dto: CreateVehiculoDto) {
    return this.vehiculosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos activos' })
  findAll(@Req() req: RequestConUsuario) {
    return this.vehiculosService.findAll(this.alcance.condicion(req, 'vehiculos'));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'vehiculos', +id);
    return this.vehiculosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'vehiculos', +id);
    return this.vehiculosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un vehículo (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'vehiculos', +id);
    return this.vehiculosService.remove(+id);
  }
}
