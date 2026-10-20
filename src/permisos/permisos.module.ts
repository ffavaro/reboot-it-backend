import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pantalla } from './pantalla.entity';
import { RolPermiso } from './rol-permiso.entity';
import { Rol } from '../roles/rol.entity';
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';
import { AmbitoService } from './ambito.service';
import { Donante } from '../donantes/donante.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { Turno } from '../turno/turno.entity';
import { Retiro } from '../retiro/retiro.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Lote } from '../lote/lote.entity';

// Global: el guard de permisos y los servicios que necesiten validar un permiso lo inyectan sin importar el módulo
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Pantalla, RolPermiso, Rol, Donante, EmpleadoTransportista, Turno, Retiro, Donacion, Lote])],
  controllers: [PermisosController],
  providers: [PermisosService, AmbitoService],
  exports: [PermisosService, AmbitoService],
})
export class PermisosModule {}
