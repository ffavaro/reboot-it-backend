import { Module } from '@nestjs/common';
import { HojaRutaService } from './hoja-ruta.service';
import { HojaRutaController } from './hoja-ruta.controller';

@Module({
  controllers: [HojaRutaController],
  providers: [HojaRutaService],
})
export class HojaRutaModule {}
