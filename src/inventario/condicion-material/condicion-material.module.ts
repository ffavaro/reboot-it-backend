import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CondicionMaterial } from './condicion-material.entity';
import { CondicionMaterialController } from './condicion-material.controller';
import { CondicionMaterialService } from './condicion-material.service';

@Module({
  imports: [TypeOrmModule.forFeature([CondicionMaterial])],
  controllers: [CondicionMaterialController],
  providers: [CondicionMaterialService],
  exports: [CondicionMaterialService],
})
export class CondicionMaterialModule {}
