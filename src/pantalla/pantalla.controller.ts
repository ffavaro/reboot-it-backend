import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PantallaService } from './pantalla.service';
import { CreatePantallaDto } from './dto/create-pantalla.dto';
import { UpdatePantallaDto } from './dto/update-pantalla.dto';

@Controller('pantalla')
export class PantallaController {
  constructor(private readonly pantallaService: PantallaService) {}

  @Post()
  create(@Body() createPantallaDto: CreatePantallaDto) {
    return this.pantallaService.create(createPantallaDto);
  }

  @Get()
  findAll() {
    return this.pantallaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pantallaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePantallaDto: UpdatePantallaDto) {
    return this.pantallaService.update(+id, updatePantallaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pantallaService.remove(+id);
  }
}
