import { Module } from '@nestjs/common';
import { HojaRutaTurnoService } from './hoja-ruta-turno.service';
import { HojaRutaTurnoController } from './hoja-ruta-turno.controller';

@Module({
  controllers: [HojaRutaTurnoController],
  providers: [HojaRutaTurnoService],
})
export class HojaRutaTurnoModule {}
