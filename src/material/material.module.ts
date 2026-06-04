import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { MedioAlmacenamiento } from '../medio-almacenamiento/medio-almacenamiento.entity';
import { ProcesoDestruccion } from '../proceso-destruccion/proceso-destruccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, MedioAlmacenamiento, ProcesoDestruccion])],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
