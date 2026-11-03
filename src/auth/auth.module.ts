import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '@app/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { Usuario } from '../usuarios/usuario.entity';
import { PasswordResetCode } from '../password-reset-code/entities/password-reset-code.entity';
import { RecuperacionContrasenaService } from '../password-reset-code/password-reset-code.service';

@Module({
  imports: [
    UsuariosModule,
    MailModule,
    TypeOrmModule.forFeature([Usuario, PasswordResetCode]),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 15 * 60_000, limit: 10 }],
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
  providers: [AuthService, RecuperacionContrasenaService],
})
export class AuthModule {}