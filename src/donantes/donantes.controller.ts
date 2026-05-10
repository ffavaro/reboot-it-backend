import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';

@ApiTags('donantes')
@Controller('donantes')
export class DonantesController {
  constructor(private readonly donantesService: DonantesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un donante' })
  create(@Body() dto: CreateDonanteDto) {
    return this.donantesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los donantes activos' })
  findAll() {
    return this.donantesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un donante por ID' })
  findOne(@Param('id') id: string) {
    return this.donantesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un donante' })
  update(@Param('id') id: string, @Body() dto: UpdateDonanteDto) {
    return this.donantesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un donante (soft delete)' })
  remove(@Param('id') id: string) {
    return this.donantesService.remove(+id);
  }
}
