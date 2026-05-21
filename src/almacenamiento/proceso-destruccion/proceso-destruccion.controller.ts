import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProcesoDestruccionService } from './proceso-destruccion.service';
import { CreateProcesoDestruccionDto } from './dto/create-proceso-destruccion.dto';
import { UpdateProcesoDestruccionDto } from './dto/update-proceso-destruccion.dto';

@ApiTags('proceso-destruccion')
@Controller('proceso-destruccion')
export class ProcesoDestruccionController {
  constructor(private readonly procesoDestruccionService: ProcesoDestruccionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un proceso de destrucción' })
  create(@Body() dto: CreateProcesoDestruccionDto) {
    return this.procesoDestruccionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los procesos de destrucción activos' })
  findAll() {
    return this.procesoDestruccionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proceso de destrucción por ID' })
  findOne(@Param('id') id: string) {
    return this.procesoDestruccionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un proceso de destrucción' })
  update(@Param('id') id: string, @Body() dto: UpdateProcesoDestruccionDto) {
    return this.procesoDestruccionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un proceso de destrucción (soft delete)' })
  remove(@Param('id') id: string) {
    return this.procesoDestruccionService.remove(+id);
  }
}
