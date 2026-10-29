import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('lotes')
@ApiTags('lote')
@Controller('lote')
export class LoteController {
  constructor(
    private readonly loteService: LoteService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un lote' })
  create(@Body() dto: CreateLoteDto) {
    return this.loteService.create(dto);
  }

  @Pantalla('lotes', 'dashboard+', 'certificado_disposicion')
  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const lista = await this.loteService.findAll();
    return a ? lista.filter((x) => a.donaciones.has(x.donacionId)) : lista;
  }

  @Pantalla('lotes', 'dashboard+', 'certificado_disposicion')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  async findOne(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const lote = await this.loteService.findOne(+id);
    this.ambito.exigir(a, 'donaciones', lote.donacionId);
    return lote;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un lote' })
  async update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateLoteDto, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'donaciones', (await this.loteService.findOne(+id)).donacionId);
    return this.loteService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un lote (soft delete)' })
  async remove(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    this.ambito.exigir(a, 'donaciones', (await this.loteService.findOne(+id)).donacionId);
    return this.loteService.remove(+id);
  }
}
