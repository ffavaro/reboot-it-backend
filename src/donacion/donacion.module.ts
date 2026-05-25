import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donacion } from './donacion.entity';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { TurnoModule } from '../turno/turno.module';
import { DonacionDetalleModule } from '../donacion-detalle/donacion-detalle.module';
import { TurnoDetalleModule } from '../turno-detalle/turno-detalle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion]), TurnoModule, DonacionDetalleModule, TurnoDetalleModule],
  controllers: [DonacionController],
  providers: [DonacionService],
  exports: [DonacionService],
})
export class DonacionModule {}
