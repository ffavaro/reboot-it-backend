import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoDestruccion } from './metodo-destruccion.entity';
import { MetodoDestruccionController } from './metodo-destruccion.controller';
import { MetodoDestruccionService } from './metodo-destruccion.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoDestruccion])],
  controllers: [MetodoDestruccionController],
  providers: [MetodoDestruccionService],
  exports: [MetodoDestruccionService],
})
export class MetodoDestruccionModule {}
