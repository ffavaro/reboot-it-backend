import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RetiroService } from './retiro.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { ReporteRetiroDto } from './dto/reporte-retiro.dto';
import { ROL, Roles } from '../auth/auth.decorators';

@ApiTags('retiro')
@Controller('retiro')
export class RetiroController {
  constructor(private readonly retiroService: RetiroService) {}

  @Roles(ROL.STAFF, ROL.TRANSPORTISTA)
  @Post()
  @ApiOperation({ summary: 'Crear un retiro' })
  create(@Body() dto: CreateRetiroDto) {
    return this.retiroService.create(dto);
  }

  @Roles(ROL.STAFF, ROL.TRANSPORTISTA, ROL.DONANTE)
  @Get()
  @ApiOperation({ summary: 'Listar todos los retiros activos' })
  findAll() {
    return this.retiroService.findAll();
  }

  @Roles(ROL.STAFF)
  @Get('reporte')
  @ApiOperation({ summary: 'Generar reporte de retiros a domicilio con filtros' })
  reporte(@Query() query: ReporteRetiroDto) {
    return this.retiroService.reporte(query);
  }

  @Roles(ROL.STAFF, ROL.TRANSPORTISTA, ROL.DONANTE)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un retiro por ID' })
  findOne(@Param('id') id: string) {
    return this.retiroService.findOne(+id);
  }

  @Roles(ROL.STAFF, ROL.TRANSPORTISTA)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un retiro' })
  update(@Param('id') id: string, @Body() dto: UpdateRetiroDto) {
    return this.retiroService.update(+id, dto);
  }

  @Roles(ROL.STAFF, ROL.TRANSPORTISTA)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un retiro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.retiroService.remove(+id);
  }
}
