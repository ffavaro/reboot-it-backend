import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificadoDisposicionService } from './certificado-disposicion.service';
import { CreateCertificadoDisposicionDto } from './dto/create-certificado-disposicion.dto';
import { UpdateCertificadoDisposicionDto } from './dto/update-certificado-disposicion.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('certificado_disposicion')
@ApiTags('certificado-disposicion')
@Controller('certificado-disposicion')
export class CertificadoDisposicionController {
  constructor(
    private readonly certificadoDisposicionService: CertificadoDisposicionService,
    private readonly ambito: AmbitoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un certificado de disposición' })
  create(@Body() dto: CreateCertificadoDisposicionDto) {
    return this.certificadoDisposicionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los certificados de disposición activos' })
  async findAll(@Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const lista = await this.certificadoDisposicionService.findAll();
    return a ? lista.filter((x) => a.lotes.has(x.loteId)) : lista;
  }

  @Get(':id/datos')
  @ApiOperation({ summary: 'Datos del certificado para generar su PDF' })
  async datos(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const certificado = await this.certificadoDisposicionService.findOne(+id);
    this.ambito.exigir(a, 'lotes', certificado.loteId);
    return this.certificadoDisposicionService.datosParaPdf(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un certificado de disposición por ID' })
  async findOne(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    const a = await this.ambito.de(req);
    const certificado = await this.certificadoDisposicionService.findOne(+id);
    this.ambito.exigir(a, 'lotes', certificado.loteId);
    return certificado;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un certificado de disposición' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateCertificadoDisposicionDto) {
    return this.certificadoDisposicionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un certificado de disposición (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.certificadoDisposicionService.remove(+id);
  }
}
