import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialKmVehiculoService } from './historial-km-vehiculo.service';
import { HistorialKmVehiculoController } from './historial-km-vehiculo.controller';
import { HistorialKmVehiculo } from './entities/historial-km-vehiculo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialKmVehiculo, Vehiculo])],
  controllers: [HistorialKmVehiculoController],
  providers: [HistorialKmVehiculoService],
})
export class HistorialKmVehiculoModule {}
