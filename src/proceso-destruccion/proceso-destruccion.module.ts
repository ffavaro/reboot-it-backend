import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcesoDestruccion } from './proceso-destruccion.entity';
import { ProcesoDestruccionController } from './proceso-destruccion.controller';
import { ProcesoDestruccionService } from './proceso-destruccion.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcesoDestruccion])],
  controllers: [ProcesoDestruccionController],
  providers: [ProcesoDestruccionService],
  exports: [ProcesoDestruccionService],
})
export class ProcesoDestruccionModule {}
