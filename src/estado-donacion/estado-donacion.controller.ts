import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstadoDonacionService } from './estado-donacion.service';
import { CreateEstadoDonacionDto } from './dto/create-estado-donacion.dto';
import { UpdateEstadoDonacionDto } from './dto/update-estado-donacion.dto';

@ApiTags('estado-donacion')
@Controller('estado-donacion')
export class EstadoDonacionController {
  constructor(private readonly service: EstadoDonacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un estado de donación' })
  create(@Body() dto: CreateEstadoDonacionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de donación activos' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado de donación por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estado de donación' })
  update(@Param('id') id: string, @Body() dto: UpdateEstadoDonacionDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un estado de donación (soft delete)' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
