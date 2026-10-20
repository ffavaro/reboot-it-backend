import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { ROL, Roles } from '../auth/auth.decorators';

@ApiTags('lote')
@Controller('lote')
export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  @Roles(ROL.STAFF)
  @Post()
  @ApiOperation({ summary: 'Crear un lote' })
  create(@Body() dto: CreateLoteDto) {
    return this.loteService.create(dto);
  }

  @Roles(ROL.STAFF, ROL.DONANTE)
  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes activos' })
  findAll() {
    return this.loteService.findAll();
  }

  @Roles(ROL.STAFF, ROL.DONANTE)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  findOne(@Param('id') id: string) {
    return this.loteService.findOne(+id);
  }

  @Roles(ROL.STAFF)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un lote' })
  update(@Param('id') id: string, @Body() dto: UpdateLoteDto) {
    return this.loteService.update(+id, dto);
  }

  @Roles(ROL.STAFF)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un lote (soft delete)' })
  remove(@Param('id') id: string) {
    return this.loteService.remove(+id);
  }
}
