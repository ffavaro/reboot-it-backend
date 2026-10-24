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
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { Lote } from '../lote/lote.entity';
import { CertificadoDisposicion } from '../certificado-disposicion/certificado-disposicion.entity';
import { RegistroFotografico } from '../registro-fotografico/registro-fotografico.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, Turno, Retiro]), TurnoModule, DonacionDetalleModule, TurnoDetalleModule, LoteModule, NotificacionesModule],
  controllers: [DonacionController],
  providers: [DonacionService],
  exports: [DonacionService],
})
export class DonacionModule {}
