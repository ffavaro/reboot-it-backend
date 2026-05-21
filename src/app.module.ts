import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './acceso/roles/roles.module';
import { EmpleadosModule } from './acceso/empleados/empleados.module';
import { UsuariosModule } from './acceso/usuarios/usuarios.module';
import { LogAccesoModule } from './acceso/logacceso/logacceso.module';
import { AuthModule } from './acceso/auth/auth.module';
import { TipoVehiculoModule } from './retiro/tipo-vehiculo/tipo-vehiculo.module';
import { VehiculosModule } from './retiro/vehiculos/vehiculos.module';
import { TipoDonanteModule } from './donaciones/tipo-donante/tipo-donante.module';
import { DonantesModule } from './donaciones/donantes/donantes.module';
import { EstadoTurnoModule } from './donaciones/estado-turno/estado-turno.module';
import { EstadoDonacionModule } from './donaciones/estado-donacion/estado-donacion.module';
import { DonacionDetalleModule } from './donaciones/donacion-detalle/donacion-detalle.module';
import { TurnoDetalleModule } from './donaciones/turno-detalle/turno-detalle.module';
import { ItemClasificadoModule } from './inventario/item-clasificado/item-clasificado.module';
import { TipoMaterialModule } from './inventario/tipo-material/tipo-material.module';
import { CondicionMaterialModule } from './inventario/condicion-material/condicion-material.module';
import { GestorAmbientalModule } from './disposicion/gestor-ambiental/gestor-ambiental.module';
import { RackModule } from './almacenamiento/rack/rack.module';
import { TurnoModule } from './donaciones/turno/turno.module';
import { EmpleadoTransportistaModule } from './retiro/empleado-transportista/empleado-transportista.module';
import { DonacionModule } from './donaciones/donacion/donacion.module';
import { LoteModule } from './inventario/lote/lote.module';
import { RetiroModule } from './retiro/retiro/retiro.module';
import { MaterialModule } from './inventario/material/material.module';
import { ClasificacionModule } from './inventario/clasificacion/clasificacion.module';
import { MedioAlmacenamientoModule } from './almacenamiento/medio-almacenamiento/medio-almacenamiento.module';
import { PalletModule } from './almacenamiento/pallet/pallet.module';
import { CertificadoDisposicionModule } from './disposicion/certificado-disposicion/certificado-disposicion.module';
import { ConstanciaRetiroModule } from './retiro/constancia-retiro/constancia-retiro.module';
import { RegistroFotograficoModule } from './inventario/registro-fotografico/registro-fotografico.module';
import { ProcesoDestruccionModule } from './almacenamiento/proceso-destruccion/proceso-destruccion.module';
import { TipoModule } from './inventario/tipo/tipo.module';
import { MarcaModule } from './inventario/marca/marca.module';
import { ModeloModule } from './inventario/modelo/modelo.module';

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
    EstadoDonacionModule,
    DonacionDetalleModule,
    TurnoDetalleModule,
    ItemClasificadoModule,
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

