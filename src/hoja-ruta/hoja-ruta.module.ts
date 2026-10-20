import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HojaRuta } from './hoja-ruta.entity';
import { HojaRutaController } from './hoja-ruta.controller';
import { HojaRutaService } from './hoja-ruta.service';
import { GoogleMapsService } from './google-maps.service';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HojaRuta, Turno, Donacion, Vehiculo])],
  controllers: [HojaRutaController],
  providers: [HojaRutaService, GoogleMapsService],
})
export class HojaRutaModule {}
