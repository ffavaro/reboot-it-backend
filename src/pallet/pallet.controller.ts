import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PalletService } from './pallet.service';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';

@ApiTags('pallets')
@Controller('pallets')
export class PalletController {
  constructor(private readonly palletService: PalletService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pallet' })
  create(@Body() dto: CreatePalletDto) {
    return this.palletService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los pallets activos' })
  findAll() {
    return this.palletService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pallet por ID' })
  findOne(@Param('id') id: string) {
    return this.palletService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pallet' })
  update(@Param('id') id: string, @Body() dto: UpdatePalletDto) {
    return this.palletService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un pallet (soft delete)' })
  remove(@Param('id') id: string) {
    return this.palletService.remove(+id);
  }
}
