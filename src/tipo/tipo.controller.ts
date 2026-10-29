import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoService } from './tipo.service';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { Pantalla } from '../auth/auth.decorators';

@Pantalla('tipos')
@ApiTags('tipo')
@Controller('tipo')
export class TipoController {
  constructor(private readonly tipoService: TipoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de dispositivo' })
  create(@Body() dto: CreateTipoDto) {
    return this.tipoService.create(dto);
  }

  @Pantalla('tipos', 'medio_almacenamiento')
  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos activos' })
  findAll() {
    return this.tipoService.findAll();
  }

  @Pantalla('tipos', 'medio_almacenamiento')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.tipoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateTipoDto) {
    return this.tipoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.tipoService.remove(+id);
  }
}
