import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { MailModule } from '../mail/mail.module';
import { Turno } from '../turno/turno.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { NotificacionDonacionService } from './notificacion-donacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, Usuario, Turno]), MailModule],
  providers: [NotificacionDonacionService],
  exports: [NotificacionDonacionService],
})
export class NotificacionesModule {}
