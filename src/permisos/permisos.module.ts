import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pantalla } from './pantalla.entity';
import { RolPermiso } from './rol-permiso.entity';
import { Rol } from '../roles/rol.entity';
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';

// Global: el guard de permisos y los servicios que necesiten validar un permiso lo inyectan sin importar el módulo
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Pantalla, RolPermiso, Rol])],
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
