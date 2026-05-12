import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoTurno } from './estado-turno.entity';
import { EstadoTurnoController } from './estado-turno.controller';
import { EstadoTurnoService } from './estado-turno.service';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoTurno])],
  controllers: [EstadoTurnoController],
  providers: [EstadoTurnoService],
  exports: [EstadoTurnoService],
})
export class EstadoTurnoModule {}
