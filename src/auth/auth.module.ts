import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '@app/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermisosGuard } from './permisos.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { Usuario } from '../usuarios/usuario.entity';
import { PasswordResetCode } from './password-reset-code.entity';
import { PasswordResetService } from './password-reset.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsuariosModule,
    MailModule,
    TypeOrmModule.forFeature([Usuario, PasswordResetCode]),
    // El límite de cada ruta (recuperar contraseña) se define con @Throttle; esto es el mensaje y el valor por defecto
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 15 * 60 * 1000, limit: 10 }],
      errorMessage: 'Demasiados intentos. Esperá unos minutos y volvé a intentar.',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (configService.get('JWT_EXPIRES_IN') ?? '1h') as '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetService,
    // Guards globales: primero se valida el token (JwtAuthGuard) y después los permisos (PermisosGuard)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermisosGuard },
  ],
})
export class AuthModule {}
