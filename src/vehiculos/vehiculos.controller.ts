import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('vehiculos')
@ApiTags('vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(
    private readonly vehiculosService: VehiculosService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un vehículo' })
  async create(@Body() dto: CreateVehiculoDto, @Req() req: RequestConUsuario) {
    // Quien solo ve su vehículo asignado no da de alta vehículos
    const a = await this.ambito.de(req);
    if (a) this.ambito.exigir(a, 'vehiculos', null);
    return this.vehiculosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const lista = await this.vehiculosService.findAll();
    return a ? lista.filter((x) => a.vehiculos.has(x.id)) : lista;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'vehiculos', +id);
    return this.vehiculosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'vehiculos', +id);
    return this.vehiculosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un vehículo (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'vehiculos', +id);
    return this.vehiculosService.remove(+id);
  }
}
