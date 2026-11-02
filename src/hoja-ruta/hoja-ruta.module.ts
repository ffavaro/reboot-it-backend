import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HojaRutaService } from './hoja-ruta.service';
import { HojaRutaConsultaService } from './hoja-ruta-consulta.service';
import { HojaRutaController } from './hoja-ruta.controller';
import { GoogleRoutesClient } from './rutas/google-routes.client';
import { RutaService } from './rutas/ruta.service';
import { HojaRuta } from './entities/hoja-ruta.entity';
import { HojaRutaTurno } from './entities/hoja-ruta-turno.entity';
import { HistorialKmVehiculo } from '../historial-km-vehiculo/entities/historial-km-vehiculo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Retiro } from '../retiro/retiro.entity';
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { TurnoModule } from '../turno/turno.module';
import { ConstanciaRetiroModule } from '../constancia-retiro/constancia-retiro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HojaRuta,
      HojaRutaTurno,
      HistorialKmVehiculo,
      Vehiculo,
      Retiro,
      ConstanciaRetiro,
      Turno,
      Donacion,
    ]),
    TurnoModule,
    ConstanciaRetiroModule,
  ],
  controllers: [HojaRutaController],
  providers: [
    HojaRutaService,
    HojaRutaConsultaService,
    RutaService,
    GoogleRoutesClient,
  ],
})
export class HojaRutaModule {}
