import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from './turno.entity';
import { TurnoController } from './turno.controller';
import { TurnoService } from './turno.service';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { Empleado } from '../empleados/empleado.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { RegistroFotografico } from '../registro-fotografico/registro-fotografico.entity';
import { Material } from '../material/material.entity';
import { CondicionMaterial } from '../condicion-material/condicion-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, EstadoTurno, Empleado, EmpleadoTransportista, RegistroFotografico, Material, CondicionMaterial])],
  controllers: [TurnoController],
  providers: [TurnoService],
  exports: [TurnoService],
})
export class TurnoModule {}
