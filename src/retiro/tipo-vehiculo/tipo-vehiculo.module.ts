import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoVehiculo } from './tipo-vehiculo.entity';
import { TipoVehiculoController } from './tipo-vehiculo.controller';
import { TipoVehiculoService } from './tipo-vehiculo.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoVehiculo])],
  controllers: [TipoVehiculoController],
  providers: [TipoVehiculoService],
  exports: [TipoVehiculoService],
})
export class TipoVehiculoModule {}
