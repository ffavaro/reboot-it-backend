import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PalletService } from './pallet.service';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';

@Pantalla('pallets')
@ApiTags('pallet')
@Controller('pallet')
export class PalletController {
  constructor(private readonly palletService: PalletService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pallet' })
  create(@Body() dto: CreatePalletDto) {
    return this.palletService.create(dto);
  }

  @Pantalla('pallets', 'racks', 'lotes')
  @Get()
  @ApiOperation({ summary: 'Listar todos los pallets activos' })
  findAll() {
    return this.palletService.findAll();
  }

  @Pantalla('pallets', 'racks', 'lotes')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pallet por ID' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.palletService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pallet' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdatePalletDto) {
    return this.palletService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un pallet (soft delete)' })
  async remove(@Param('id', ParseIdPipe) id: number, @Req() req: RequestConUsuario) {
    if (req.permiso?.alcance === 'LIMITADO') await this.palletService.validarBajaDelTecnico(+id);
    return this.palletService.remove(+id);
  }
}
