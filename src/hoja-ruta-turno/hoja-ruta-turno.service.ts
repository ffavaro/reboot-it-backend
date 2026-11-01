import { Injectable } from '@nestjs/common';
import { CreateHojaRutaTurnoDto } from './dto/create-hoja-ruta-turno.dto';
import { UpdateHojaRutaTurnoDto } from './dto/update-hoja-ruta-turno.dto';

@Injectable()
export class HojaRutaTurnoService {
  create(createHojaRutaTurnoDto: CreateHojaRutaTurnoDto) {
    return 'This action adds a new hojaRutaTurno';
  }

  findAll() {
    return `This action returns all hojaRutaTurno`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hojaRutaTurno`;
  }

  update(id: number, updateHojaRutaTurnoDto: UpdateHojaRutaTurnoDto) {
    return `This action updates a #${id} hojaRutaTurno`;
  }

  remove(id: number) {
    return `This action removes a #${id} hojaRutaTurno`;
  }
}
