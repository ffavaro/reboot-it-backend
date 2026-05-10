import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@ApiTags('vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un vehículo' })
  create(@Body() dto: CreateVehiculoDto) {
    return this.vehiculosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos activos' })
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto) {
    return this.vehiculosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un vehículo (soft delete)' })
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(+id);
  }
}
