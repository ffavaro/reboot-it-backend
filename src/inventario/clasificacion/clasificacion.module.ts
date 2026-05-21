import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clasificacion } from './clasificacion.entity';
import { ClasificacionController } from './clasificacion.controller';
import { ClasificacionService } from './clasificacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clasificacion])],
  controllers: [ClasificacionController],
  providers: [ClasificacionService],
  exports: [ClasificacionService],
})
export class ClasificacionModule {}
