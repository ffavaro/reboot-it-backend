import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonacionDetalleService } from './donacion-detalle.service';
import { CreateDonacionDetalleDto } from './dto/create-donacion-detalle.dto';
import { UpdateDonacionDetalleDto } from './dto/update-donacion-detalle.dto';
import { Accion, Pantalla } from '../auth/auth.decorators';

// Endpoints internos (el frontend no los usa): solo quien puede editar donaciones por completo
@Accion('editar')
@Pantalla('donaciones!')
@ApiTags('donacion-detalle')
@Controller('donacion-detalle')
export class DonacionDetalleController {
  constructor(private readonly service: DonacionDetalleService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un detalle de donación' })
  create(@Body() dto: CreateDonacionDetalleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los detalles activos' })
  findAll() {
    return this.service.findAll();
  }

  @Get('donacion/:donacionId')
  @ApiOperation({ summary: 'Listar detalles de una donación específica' })
  findByDonacion(@Param('donacionId', ParseIdPipe) donacionId: number) {
    return this.service.findByDonacion(+donacionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un detalle de donación' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateDonacionDetalleDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un detalle (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.service.remove(+id);
  }
}
