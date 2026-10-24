import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pallet } from './pallet.entity';
import { Lote } from '../lote/lote.entity';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { PalletController } from './pallet.controller';
import { PalletService } from './pallet.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pallet, Lote, Turno, Donacion, EstadoDonacion, EstadoTurno]), NotificacionesModule],
  controllers: [PalletController],
  providers: [PalletService],
  exports: [PalletService],
})
export class PalletModule {}
