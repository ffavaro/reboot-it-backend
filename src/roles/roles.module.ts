import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './rol.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Usuario } from '@app/usuarios/usuario.entity';
import { Empleado } from '@app/empleados/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Usuario, Empleado])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
