import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClasificacionService } from './clasificacion.service';
import { CreateClasificacionDto } from './dto/create-clasificacion.dto';
import { UpdateClasificacionDto } from './dto/update-clasificacion.dto';

@ApiTags('clasificaciones')
@Controller('clasificaciones')
export class ClasificacionController {
  constructor(private readonly clasificacionService: ClasificacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una clasificación' })
  create(@Body() dto: CreateClasificacionDto) {
    return this.clasificacionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las clasificaciones activas' })
  findAll() {
    return this.clasificacionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una clasificación por ID' })
  findOne(@Param('id') id: string) {
    return this.clasificacionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una clasificación' })
  update(@Param('id') id: string, @Body() dto: UpdateClasificacionDto) {
    return this.clasificacionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una clasificación (soft delete)' })
  remove(@Param('id') id: string) {
    return this.clasificacionService.remove(+id);
  }
}
