import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HojaRuta } from './hoja-ruta.entity';
import { HojaRutaController } from './hoja-ruta.controller';
import { HojaRutaService } from './hoja-ruta.service';
import { GoogleMapsService } from './google-maps.service';
import { ClimaService } from './clima.service';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

import { HojaRutaTurno } from './hoja-ruta-turno.entity';
import { TurnoModule } from '../turno/turno.module';
import { ConstanciaRetiroModule } from '../constancia-retiro/constancia-retiro.module';

@Module({
  imports: [TypeOrmModule.forFeature([HojaRuta, HojaRutaTurno, Turno, Donacion, Vehiculo]), TurnoModule, ConstanciaRetiroModule],
  controllers: [HojaRutaController],
  providers: [HojaRutaService, GoogleMapsService, ClimaService],
})
export class HojaRutaModule {}
