import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoMaterial } from './tipo-material.entity';
import { TipoMaterialController } from './tipo-material.controller';
import { TipoMaterialService } from './tipo-material.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoMaterial])],
  controllers: [TipoMaterialController],
  providers: [TipoMaterialService],
  exports: [TipoMaterialService],
})
export class TipoMaterialModule {}
