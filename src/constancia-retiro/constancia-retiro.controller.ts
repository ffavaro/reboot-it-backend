import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConstanciaRetiroService } from './constancia-retiro.service';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';

@ApiTags('constancia-retiro')
@Controller('constancia-retiro')
export class ConstanciaRetiroController {
  constructor(private readonly constanciaRetiroService: ConstanciaRetiroService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una constancia de retiro' })
  create(@Body() dto: CreateConstanciaRetiroDto) {
    return this.constanciaRetiroService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las constancias de retiro activas' })
  findAll() {
    return this.constanciaRetiroService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una constancia de retiro por ID' })
  findOne(@Param('id') id: string) {
    return this.constanciaRetiroService.findOne(+id);
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
