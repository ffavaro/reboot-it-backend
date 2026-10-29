import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GestorAmbientalService } from './gestor-ambiental.service';
import { CreateGestorAmbientalDto } from './dto/create-gestor-ambiental.dto';
import { UpdateGestorAmbientalDto } from './dto/update-gestor-ambiental.dto';
import { Pantalla } from '../auth/auth.decorators';

@Pantalla('gestora_ambiental')
@ApiTags('gestor-ambiental')
@Controller('gestor-ambiental')
export class GestorAmbientalController {
  constructor(private readonly gestorAmbientalService: GestorAmbientalService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un gestor ambiental' })
  create(@Body() dto: CreateGestorAmbientalDto) {
    return this.gestorAmbientalService.create(dto);
  }

  @Pantalla('gestora_ambiental', 'certificado_disposicion', 'proceso_destruccion')
  @Get()
  @ApiOperation({ summary: 'Listar todos los gestores ambientales activos' })
  findAll() {
    return this.gestorAmbientalService.findAll();
  }

  @Pantalla('gestora_ambiental', 'certificado_disposicion', 'proceso_destruccion')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un gestor ambiental por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.gestorAmbientalService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un gestor ambiental' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateGestorAmbientalDto) {
    return this.gestorAmbientalService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un gestor ambiental (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.gestorAmbientalService.remove(+id);
  }
}
