import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HojaRutaService } from './hoja-ruta.service';
import { CreateHojaRutaDto } from './dto/create-hoja-ruta.dto';
import { UpdateHojaRutaDto } from './dto/update-hoja-ruta.dto';

@Controller('hoja-ruta')
export class HojaRutaController {
  constructor(private readonly hojaRutaService: HojaRutaService) {}

  @Post()
  create(@Body() createHojaRutaDto: CreateHojaRutaDto) {
    return this.hojaRutaService.create(createHojaRutaDto);
  }

  @Get()
  findAll() {
    return this.hojaRutaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hojaRutaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHojaRutaDto: UpdateHojaRutaDto) {
    return this.hojaRutaService.update(+id, updateHojaRutaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hojaRutaService.remove(+id);
  }
}
