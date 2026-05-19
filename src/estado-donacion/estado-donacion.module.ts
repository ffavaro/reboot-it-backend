import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoDonacion } from './estado-donacion.entity';
import { EstadoDonacionController } from './estado-donacion.controller';
import { EstadoDonacionService } from './estado-donacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoDonacion])],
  controllers: [EstadoDonacionController],
  providers: [EstadoDonacionService],
  exports: [EstadoDonacionService],
})
export class EstadoDonacionModule {}
