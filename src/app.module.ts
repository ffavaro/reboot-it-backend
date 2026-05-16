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
import { EstadoTurnoModule } from './estado-turno/estado-turno.module';
import { TipoMaterialModule } from './tipo-material/tipo-material.module';
import { CondicionMaterialModule } from './condicion-material/condicion-material.module';
import { GestorAmbientalModule } from './gestor-ambiental/gestor-ambiental.module';
import { RackModule } from './rack/rack.module';
import { TurnoModule } from './turno/turno.module';
import { EmpleadoTransportistaModule } from './empleado-transportista/empleado-transportista.module';
import { DonacionModule } from './donacion/donacion.module';
import { LoteModule } from './lote/lote.module';
import { RetiroModule } from './retiro/retiro.module';
import { MaterialModule } from './material/material.module';
import { ClasificacionModule } from './clasificacion/clasificacion.module';
import { MedioAlmacenamientoModule } from './medio-almacenamiento/medio-almacenamiento.module';
import { PalletModule } from './pallet/pallet.module';
import { CertificadoDisposicionModule } from './certificado-disposicion/certificado-disposicion.module';
import { ConstanciaRetiroModule } from './constancia-retiro/constancia-retiro.module';
import { RegistroFotograficoModule } from './registro-fotografico/registro-fotografico.module';
import { ProcesoDestruccionModule } from './proceso-destruccion/proceso-destruccion.module';
import { TipoModule } from './tipo/tipo.module';
import { MarcaModule } from './marca/marca.module';
import { ModeloModule } from './modelo/modelo.module';

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
    EstadoTurnoModule,
    TipoMaterialModule,
    CondicionMaterialModule,
    GestorAmbientalModule,
    RackModule,
    TurnoModule,
    EmpleadoTransportistaModule,
    DonacionModule,
    LoteModule,
    RetiroModule,
    MaterialModule,
    ClasificacionModule,
    MedioAlmacenamientoModule,
    PalletModule,
    CertificadoDisposicionModule,
    ConstanciaRetiroModule,
    RegistroFotograficoModule,
    ProcesoDestruccionModule,
    TipoModule,
    MarcaModule,
    ModeloModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

