import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoProcesoDestruccion } from './estado-proceso-destruccion.entity';
import { EstadoProcesoDestruccionController } from './estado-proceso-destruccion.controller';
import { EstadoProcesoDestruccionService } from './estado-proceso-destruccion.service';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoProcesoDestruccion])],
  controllers: [EstadoProcesoDestruccionController],
  providers: [EstadoProcesoDestruccionService],
  exports: [EstadoProcesoDestruccionService],
})
export class EstadoProcesoDestruccionModule {}
