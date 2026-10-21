import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConstanciaRetiroService } from './constancia-retiro.service';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';
import { ocultarDatosPrivadosDelTransportista } from '../common/ocultar-datos-transportista';

@Pantalla('constancia_retiro')
@ApiTags('constancia-retiro')
@Controller('constancia-retiro')
export class ConstanciaRetiroController {
  constructor(
    private readonly constanciaRetiroService: ConstanciaRetiroService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una constancia de retiro' })
  async create(@Body() dto: CreateConstanciaRetiroDto, @Req() req: RequestConUsuario) {
    this.ambito.exigir(await this.ambito.de(req), 'retiros', dto.retiroId);
    return this.constanciaRetiroService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las constancias de retiro activas' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const lista = await this.constanciaRetiroService.findAll();
    return a ? lista.filter((x) => a.retiros.has(x.retiroId)) : lista;
  }

  @Get(':id/datos')
  @ApiOperation({ summary: 'Datos de la constancia para mostrarla y descargarla en PDF' })
  async datos(@Param('id') id: string, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const constancia = await this.constanciaRetiroService.findOne(+id);
    this.ambito.exigir(a, 'retiros', constancia.retiroId);
    const datos = await this.constanciaRetiroService.datosParaPdf(+id);
    return a?.donanteId != null ? ocultarDatosPrivadosDelTransportista(datos) : datos;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una constancia de retiro por ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const constancia = await this.constanciaRetiroService.findOne(+id);
    this.ambito.exigir(a, 'retiros', constancia.retiroId);
    return constancia;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una constancia de retiro' })
  update(@Param('id') id: string, @Body() dto: UpdateConstanciaRetiroDto) {
    return this.constanciaRetiroService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una constancia de retiro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.constanciaRetiroService.remove(+id);
  }
}
