import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificadoDisposicionService } from './certificado-disposicion.service';
import { CreateCertificadoDisposicionDto } from './dto/create-certificado-disposicion.dto';
import { UpdateCertificadoDisposicionDto } from './dto/update-certificado-disposicion.dto';

@ApiTags('certificado-disposicion')
@Controller('certificado-disposicion')
export class CertificadoDisposicionController {
  constructor(private readonly certificadoDisposicionService: CertificadoDisposicionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un certificado de disposición' })
  create(@Body() dto: CreateCertificadoDisposicionDto) {
    return this.certificadoDisposicionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los certificados de disposición activos' })
  findAll() {
    return this.certificadoDisposicionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un certificado de disposición por ID' })
  findOne(@Param('id') id: string) {
    return this.certificadoDisposicionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un certificado de disposición' })
  update(@Param('id') id: string, @Body() dto: UpdateCertificadoDisposicionDto) {
    return this.certificadoDisposicionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un certificado de disposición (soft delete)' })
  remove(@Param('id') id: string) {
    return this.certificadoDisposicionService.remove(+id);
  }
}
