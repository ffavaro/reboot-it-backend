import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonacionService } from './donacion.service';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';

@ApiTags('donaciones')
@Controller('donaciones')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una donación' })
  create(@Body() dto: CreateDonacionDto) {
    return this.donacionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las donaciones activas' })
  findAll() {
    return this.donacionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una donación por ID' })
  findOne(@Param('id') id: string) {
    return this.donacionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una donación' })
  update(@Param('id') id: string, @Body() dto: UpdateDonacionDto) {
    return this.donacionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una donación (soft delete)' })
  remove(@Param('id') id: string) {
    return this.donacionService.remove(+id);
  }
}
