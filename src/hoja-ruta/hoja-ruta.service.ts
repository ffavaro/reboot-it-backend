import { Injectable } from '@nestjs/common';
import { CreateHojaRutaDto } from './dto/create-hoja-ruta.dto';
import { UpdateHojaRutaDto } from './dto/update-hoja-ruta.dto';

@Injectable()
export class HojaRutaService {
  create(createHojaRutaDto: CreateHojaRutaDto) {
    return 'This action adds a new hojaRuta';
  }

  findAll() {
    return `This action returns all hojaRuta`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hojaRuta`;
  }

  update(id: number, updateHojaRutaDto: UpdateHojaRutaDto) {
    return `This action updates a #${id} hojaRuta`;
  }

  remove(id: number) {
    return `This action removes a #${id} hojaRuta`;
  }
}
