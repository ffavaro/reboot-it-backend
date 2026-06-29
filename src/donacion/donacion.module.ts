import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donacion } from './donacion.entity';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { TurnoModule } from '../turno/turno.module';
import { DonacionDetalleModule } from '../donacion-detalle/donacion-detalle.module';
import { TurnoDetalleModule } from '../turno-detalle/turno-detalle.module';
import { LoteModule } from '../lote/lote.module';
import { Turno } from '../turno/turno.entity';
import { Retiro } from '../retiro/retiro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, Turno, Retiro]), TurnoModule, DonacionDetalleModule, TurnoDetalleModule, LoteModule],
  controllers: [DonacionController],
  providers: [DonacionService],
  exports: [DonacionService],
})
export class DonacionModule {}
