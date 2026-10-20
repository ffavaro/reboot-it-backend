import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonacionService } from './donacion.service';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { ReporteDonacionDto } from './dto/reporte-donacion.dto';
import { ROL, Roles } from '../auth/auth.decorators';

@ApiTags('donacion')
@Controller('donacion')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}

  @Roles(ROL.STAFF, ROL.DONANTE)
  @Post()
  @ApiOperation({ summary: 'Crear una donación' })
  create(@Body() dto: CreateDonacionDto) {
    return this.donacionService.create(dto);
  }

  @Roles(ROL.STAFF, ROL.DONANTE, ROL.TRANSPORTISTA)
  @Get()
  @ApiOperation({ summary: 'Listar todas las donaciones activas' })
  findAll() {
    return this.donacionService.findAll();
  }

  @Roles(ROL.STAFF)
  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de donaciones con filtros' })
  reporte(@Query() query: ReporteDonacionDto) {
    return this.donacionService.reporte(query);
  }

  @Roles(ROL.STAFF, ROL.DONANTE, ROL.TRANSPORTISTA)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una donación por ID' })
  findOne(@Param('id') id: string) {
    return this.donacionService.findOne(+id);
  }

  @Roles(ROL.STAFF, ROL.DONANTE)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una donación' })
  update(@Param('id') id: string, @Body() dto: UpdateDonacionDto) {
    return this.donacionService.update(+id, dto);
  }

  @Roles(ROL.STAFF, ROL.DONANTE)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una donación (soft delete)' })
  remove(@Param('id') id: string) {
    return this.donacionService.remove(+id);
  }
}
