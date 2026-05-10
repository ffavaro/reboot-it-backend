import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoVehiculoService } from './tipo-vehiculo.service';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';

@ApiTags('tipo-vehiculo')
@Controller('tipo-vehiculo')
export class TipoVehiculoController {
  constructor(private readonly tipoVehiculoService: TipoVehiculoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de vehículo' })
  create(@Body() dto: CreateTipoVehiculoDto) {
    return this.tipoVehiculoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de vehículo activos' })
  findAll() {
    return this.tipoVehiculoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de vehículo por ID' })
  findOne(@Param('id') id: string) {
    return this.tipoVehiculoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de vehículo' })
  update(@Param('id') id: string, @Body() dto: UpdateTipoVehiculoDto) {
    return this.tipoVehiculoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de vehículo (soft delete)' })
  remove(@Param('id') id: string) {
    return this.tipoVehiculoService.remove(+id);
  }
}
