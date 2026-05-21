import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonacionDetalle } from './donacion-detalle.entity';
import { DonacionDetalleController } from './donacion-detalle.controller';
import { DonacionDetalleService } from './donacion-detalle.service';

@Module({
  imports: [TypeOrmModule.forFeature([DonacionDetalle])],
  controllers: [DonacionDetalleController],
  providers: [DonacionDetalleService],
  exports: [DonacionDetalleService],
})
export class DonacionDetalleModule {}
