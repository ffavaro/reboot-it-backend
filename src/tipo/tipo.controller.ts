import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoService } from './tipo.service';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';

@ApiTags('tipo')
@Controller('tipo')
export class TipoController {
  constructor(private readonly tipoService: TipoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de dispositivo' })
  create(@Body() dto: CreateTipoDto) {
    return this.tipoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos activos' })
  findAll() {
    return this.tipoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo por ID' })
  findOne(@Param('id') id: string) {
    return this.tipoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo' })
  update(@Param('id') id: string, @Body() dto: UpdateTipoDto) {
    return this.tipoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo (soft delete)' })
  remove(@Param('id') id: string) {
    return this.tipoService.remove(+id);
  }
}
