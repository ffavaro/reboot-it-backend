import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarcaService } from './marca.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Pantalla } from '../auth/auth.decorators';

@Pantalla('marcas')
@ApiTags('marca')
@Controller('marca')
export class MarcaController {
  constructor(private readonly marcaService: MarcaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una marca' })
  create(@Body() dto: CreateMarcaDto) {
    return this.marcaService.create(dto);
  }

  @Pantalla('marcas', 'medio_almacenamiento', 'modelos')
  @Get()
  @ApiOperation({ summary: 'Listar todas las marcas activas' })
  findAll() {
    return this.marcaService.findAll();
  }

  @Pantalla('marcas', 'medio_almacenamiento', 'modelos')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.marcaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una marca' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateMarcaDto) {
    return this.marcaService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una marca (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.marcaService.remove(+id);
  }
}
