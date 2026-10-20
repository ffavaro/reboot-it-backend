import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './rol.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Empleado } from '../empleados/empleado.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Usuario, Empleado])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
