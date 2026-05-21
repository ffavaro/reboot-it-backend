import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RackService } from './rack.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

@ApiTags('rack')
@Controller('rack')
export class RackController {
  constructor(private readonly rackService: RackService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rack' })
  create(@Body() dto: CreateRackDto) {
    return this.rackService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los racks activos' })
  findAll() {
    return this.rackService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rack por ID' })
  findOne(@Param('id') id: string) {
    return this.rackService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rack' })
  update(@Param('id') id: string, @Body() dto: UpdateRackDto) {
    return this.rackService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un rack (soft delete)' })
  remove(@Param('id') id: string) {
    return this.rackService.remove(+id);
  }
}
