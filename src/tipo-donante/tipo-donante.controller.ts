import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoDonanteService } from './tipo-donante.service';
import { CreateTipoDonanteDto } from './dto/create-tipo-donante.dto';
import { UpdateTipoDonanteDto } from './dto/update-tipo-donante.dto';
import { Authenticated, Public, ROL, Roles } from '../auth/auth.decorators';

@ApiTags('tipo-donante')
@Controller('tipo-donante')
export class TipoDonanteController {
  constructor(private readonly tipoDonanteService: TipoDonanteService) {}

  @Roles(ROL.STAFF)
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
  findOne(@Param('id') id: string) {
    return this.tipoDonanteService.findOne(+id);
  }

  @Roles(ROL.STAFF)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de donante' })
  update(@Param('id') id: string, @Body() dto: UpdateTipoDonanteDto) {
    return this.tipoDonanteService.update(+id, dto);
  }

  @Roles(ROL.STAFF)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de donante (soft delete)' })
  remove(@Param('id') id: string) {
    return this.tipoDonanteService.remove(+id);
  }
}
