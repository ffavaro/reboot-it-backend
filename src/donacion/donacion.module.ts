import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donacion } from './donacion.entity';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { TurnoModule } from '../turno/turno.module';
import { DonacionDetalleModule } from '../donacion-detalle/donacion-detalle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion]), TurnoModule, DonacionDetalleModule],
  controllers: [DonacionController],
  providers: [DonacionService],
  exports: [DonacionService],
})
export class DonacionModule {}
