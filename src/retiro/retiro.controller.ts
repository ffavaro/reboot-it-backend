import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RetiroService } from './retiro.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { ReporteRetiroDto } from './dto/reporte-retiro.dto';

@ApiTags('retiro')
@Controller('retiro')
export class RetiroController {
  constructor(private readonly retiroService: RetiroService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un retiro' })
  create(@Body() dto: CreateRetiroDto) {
    return this.retiroService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los retiros activos' })
  findAll() {
    return this.retiroService.findAll();
  }

  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de retiros a domicilio con filtros' })
  reporte(@Query() query: ReporteRetiroDto) {
    return this.retiroService.reporte(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un retiro por ID' })
  findOne(@Param('id') id: string) {
    return this.retiroService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un retiro' })
  update(@Param('id') id: string, @Body() dto: UpdateRetiroDto) {
    return this.retiroService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un retiro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.retiroService.remove(+id);
  }
}
