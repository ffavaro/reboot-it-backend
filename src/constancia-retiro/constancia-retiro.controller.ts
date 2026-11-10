import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConstanciaRetiroService } from './constancia-retiro.service';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { AlcanceService } from '../permisos/alcance.service';

@Pantalla('constancia_retiro')
@ApiTags('constancia-retiro')
@Controller('constancia-retiro')
export class ConstanciaRetiroController {
  constructor(
    private readonly constanciaRetiroService: ConstanciaRetiroService,
    private readonly alcance: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una constancia de retiro' })
  async create(@Body() dto: CreateConstanciaRetiroDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'retiros', dto.retiroId);
    return this.constanciaRetiroService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las constancias de retiro activas' })
  async findAll(@Req() req: RequestConUsuario) {
    const constancias = await this.constanciaRetiroService.findAll(this.alcance.condicion(req, 'constancias'));
    return this.alcance.paraElSolicitante(req, constancias);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una constancia de retiro por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'constancias', +id);
    return this.alcance.paraElSolicitante(req, await this.constanciaRetiroService.findOne(+id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una constancia de retiro' })
  async update(@Param('id') id: string, @Body() dto: UpdateConstanciaRetiroDto, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'constancias', +id);
    return this.constanciaRetiroService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una constancia de retiro (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.alcance.exigir(req, 'constancias', +id);
    return this.constanciaRetiroService.remove(+id);
  }
}
