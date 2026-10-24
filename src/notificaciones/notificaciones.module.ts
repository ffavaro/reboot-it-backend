import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { MailModule } from '../mail/mail.module';
import { Usuario } from '../usuarios/usuario.entity';
import { NotificacionDonacionService } from './notificacion-donacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, Usuario]), MailModule],
  providers: [NotificacionDonacionService],
  exports: [NotificacionDonacionService],
})
export class NotificacionesModule {}
