import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstadoProcesoDestruccionService } from './estado-proceso-destruccion.service';
import { CreateEstadoProcesoDestruccionDto } from './dto/create-estado-proceso-destruccion.dto';
import { UpdateEstadoProcesoDestruccionDto } from './dto/update-estado-proceso-destruccion.dto';

@ApiTags('estado-proceso-destruccion')
@Controller('estado-proceso-destruccion')
export class EstadoProcesoDestruccionController {
  constructor(private readonly service: EstadoProcesoDestruccionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un estado de proceso de destrucción' })
  create(@Body() dto: CreateEstadoProcesoDestruccionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de proceso de destrucción activos' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado de proceso de destrucción por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estado de proceso de destrucción' })
  update(@Param('id') id: string, @Body() dto: UpdateEstadoProcesoDestruccionDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un estado de proceso de destrucción (soft delete)' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
