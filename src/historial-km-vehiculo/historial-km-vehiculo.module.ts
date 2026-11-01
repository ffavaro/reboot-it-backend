import { Module } from '@nestjs/common';
import { HistorialKmVehiculoService } from './historial-km-vehiculo.service';
import { HistorialKmVehiculoController } from './historial-km-vehiculo.controller';

@Module({
  controllers: [HistorialKmVehiculoController],
  providers: [HistorialKmVehiculoService],
})
export class HistorialKmVehiculoModule {}
