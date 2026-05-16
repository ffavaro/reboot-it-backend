import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarcaService } from './marca.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@ApiTags('marca')
@Controller('marca')
export class MarcaController {
  constructor(private readonly marcaService: MarcaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una marca' })
  create(@Body() dto: CreateMarcaDto) {
    return this.marcaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las marcas activas' })
  findAll() {
    return this.marcaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  findOne(@Param('id') id: string) {
    return this.marcaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una marca' })
  update(@Param('id') id: string, @Body() dto: UpdateMarcaDto) {
    return this.marcaService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una marca (soft delete)' })
  remove(@Param('id') id: string) {
    return this.marcaService.remove(+id);
  }
}
