import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialKmVehiculo } from './historial-km-vehiculo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { HistorialKmVehiculoController } from './historial-km-vehiculo.controller';
import { HistorialKmVehiculoService } from './historial-km-vehiculo.service';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialKmVehiculo, Vehiculo])],
  controllers: [HistorialKmVehiculoController],
  providers: [HistorialKmVehiculoService],
  exports: [HistorialKmVehiculoService],
})
export class HistorialKmVehiculoModule {}
