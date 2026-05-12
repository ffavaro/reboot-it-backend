import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegistroFotograficoService } from './registro-fotografico.service';
import { CreateRegistroFotograficoDto } from './dto/create-registro-fotografico.dto';
import { UpdateRegistroFotograficoDto } from './dto/update-registro-fotografico.dto';

@ApiTags('registro-fotografico')
@Controller('registro-fotografico')
export class RegistroFotograficoController {
  constructor(private readonly registroFotograficoService: RegistroFotograficoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un registro fotográfico' })
  create(@Body() dto: CreateRegistroFotograficoDto) {
    return this.registroFotograficoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los registros fotográficos activos' })
  findAll() {
    return this.registroFotograficoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro fotográfico por ID' })
  findOne(@Param('id') id: string) {
    return this.registroFotograficoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro fotográfico' })
  update(@Param('id') id: string, @Body() dto: UpdateRegistroFotograficoDto) {
    return this.registroFotograficoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un registro fotográfico (soft delete)' })
  remove(@Param('id') id: string) {
    return this.registroFotograficoService.remove(+id);
  }
}
