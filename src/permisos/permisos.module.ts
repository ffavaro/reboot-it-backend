import { Global, Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pantalla } from './entities/pantalla.entity';
import { RolPermiso } from './entities/rol-permisos.entity';
import { Rol } from '@app/roles/rol.entity';
import { AlcanceService } from './alcance.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Pantalla, RolPermiso, Rol])],
  controllers: [PermisosController],
  providers: [PermisosService, AlcanceService],
  exports:[PermisosService, AlcanceService]
})
export class PermisosModule {}
