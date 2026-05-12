import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MedioAlmacenamientoService } from './medio-almacenamiento.service';
import { CreateMedioAlmacenamientoDto } from './dto/create-medio-almacenamiento.dto';
import { UpdateMedioAlmacenamientoDto } from './dto/update-medio-almacenamiento.dto';

@ApiTags('medio-almacenamiento')
@Controller('medio-almacenamiento')
export class MedioAlmacenamientoController {
  constructor(private readonly medioAlmacenamientoService: MedioAlmacenamientoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un medio de almacenamiento' })
  create(@Body() dto: CreateMedioAlmacenamientoDto) {
    return this.medioAlmacenamientoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los medios de almacenamiento activos' })
  findAll() {
    return this.medioAlmacenamientoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medio de almacenamiento por ID' })
  findOne(@Param('id') id: string) {
    return this.medioAlmacenamientoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un medio de almacenamiento' })
  update(@Param('id') id: string, @Body() dto: UpdateMedioAlmacenamientoDto) {
    return this.medioAlmacenamientoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un medio de almacenamiento (soft delete)' })
  remove(@Param('id') id: string) {
    return this.medioAlmacenamientoService.remove(+id);
  }
}
