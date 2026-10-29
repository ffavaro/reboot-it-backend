import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MetodoDestruccionService } from './metodo-destruccion.service';
import { CreateMetodoDestruccionDto } from './dto/create-metodo-destruccion.dto';
import { UpdateMetodoDestruccionDto } from './dto/update-metodo-destruccion.dto';
import { Pantalla } from '../auth/auth.decorators';

@Pantalla('metodos_destruccion')
@ApiTags('metodo-destruccion')
@Controller('metodo-destruccion')
export class MetodoDestruccionController {
  constructor(private readonly service: MetodoDestruccionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un método de destrucción' })
  create(@Body() dto: CreateMetodoDestruccionDto) {
    return this.service.create(dto);
  }

  @Pantalla('metodos_destruccion', 'proceso_destruccion')
  @Get()
  @ApiOperation({ summary: 'Listar todos los métodos de destrucción activos' })
  findAll() {
    return this.service.findAll();
  }

  @Pantalla('metodos_destruccion', 'proceso_destruccion')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un método de destrucción por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un método de destrucción' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateMetodoDestruccionDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un método de destrucción (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.service.remove(+id);
  }
}
