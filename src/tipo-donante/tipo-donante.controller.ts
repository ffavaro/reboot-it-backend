import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoDonanteService } from './tipo-donante.service';
import { CreateTipoDonanteDto } from './dto/create-tipo-donante.dto';
import { UpdateTipoDonanteDto } from './dto/update-tipo-donante.dto';
import { Pantalla, Authenticated, Public } from '../auth/auth.decorators';

@Pantalla('donantes')
@ApiTags('tipo-donante')
@Controller('tipo-donante')
export class TipoDonanteController {
  constructor(private readonly tipoDonanteService: TipoDonanteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de donante' })
  create(@Body() dto: CreateTipoDonanteDto) {
    return this.tipoDonanteService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de donante activos' })
  findAll() {
    return this.tipoDonanteService.findAll();
  }

  @Authenticated()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de donante por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.tipoDonanteService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de donante' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateTipoDonanteDto) {
    return this.tipoDonanteService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de donante (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.tipoDonanteService.remove(+id);
  }
}
