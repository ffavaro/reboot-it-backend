import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { LogAccesoModule } from './logacceso/logacceso.module';
import { AuthModule } from './auth/auth.module';
import { TipoVehiculoModule } from './tipo-vehiculo/tipo-vehiculo.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { TipoDonanteModule } from './tipo-donante/tipo-donante.module';
import { DonantesModule } from './donantes/donantes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    RolesModule,
    EmpleadosModule,
    UsuariosModule,
    LogAccesoModule,
    AuthModule,
    TipoVehiculoModule,
    VehiculosModule,
    TipoDonanteModule,
    DonantesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

