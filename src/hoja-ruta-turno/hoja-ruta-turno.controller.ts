import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HojaRutaTurnoService } from './hoja-ruta-turno.service';
import { CreateHojaRutaTurnoDto } from './dto/create-hoja-ruta-turno.dto';
import { UpdateHojaRutaTurnoDto } from './dto/update-hoja-ruta-turno.dto';

@Controller('hoja-ruta-turno')
export class HojaRutaTurnoController {
  constructor(private readonly hojaRutaTurnoService: HojaRutaTurnoService) {}

  @Post()
  create(@Body() createHojaRutaTurnoDto: CreateHojaRutaTurnoDto) {
    return this.hojaRutaTurnoService.create(createHojaRutaTurnoDto);
  }

  @Get()
  findAll() {
    return this.hojaRutaTurnoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hojaRutaTurnoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHojaRutaTurnoDto: UpdateHojaRutaTurnoDto) {
    return this.hojaRutaTurnoService.update(+id, updateHojaRutaTurnoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hojaRutaTurnoService.remove(+id);
  }
}
