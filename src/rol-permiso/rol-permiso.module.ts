import { Module } from '@nestjs/common';
import { RolPermisoService } from './rol-permiso.service';
import { RolPermisoController } from './rol-permiso.controller';

@Module({
  controllers: [RolPermisoController],
  providers: [RolPermisoService],
})
export class RolPermisoModule {}
