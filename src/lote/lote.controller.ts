import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('lotes')
@ApiTags('lote')
@Controller('lote')
export class LoteController {
  constructor(
    private readonly loteService: LoteService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un lote' })
  create(@Body() dto: CreateLoteDto) {
    return this.loteService.create(dto);
  }

  @Pantalla('lotes', 'dashboard', 'certificado_disposicion')
  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes activos' })
  findAll(@Req() req: RequestConUsuario) {
    return this.loteService.findAll(this.alcance.condicion(req, 'lotes'));
  }

  @Pantalla('lotes', 'dashboard', 'certificado_disposicion')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'lotes', +id);
    return this.loteService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un lote' })
  async update(@Param('id') id: string, @Body() dto: UpdateLoteDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'lotes', +id);
    return this.loteService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un lote (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'lotes', +id);
    return this.loteService.remove(+id);
  }
}
