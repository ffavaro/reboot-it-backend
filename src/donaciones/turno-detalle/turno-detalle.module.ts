import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnoDetalle } from './turno-detalle.entity';
import { TurnoDetalleController } from './turno-detalle.controller';
import { TurnoDetalleService } from './turno-detalle.service';

@Module({
  imports: [TypeOrmModule.forFeature([TurnoDetalle])],
  controllers: [TurnoDetalleController],
  providers: [TurnoDetalleService],
  exports: [TurnoDetalleService],
})
export class TurnoDetalleModule {}
