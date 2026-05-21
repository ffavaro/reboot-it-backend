import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemClasificado } from './item-clasificado.entity';
import { ItemClasificadoController } from './item-clasificado.controller';
import { ItemClasificadoService } from './item-clasificado.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemClasificado])],
  controllers: [ItemClasificadoController],
  providers: [ItemClasificadoService],
  exports: [ItemClasificadoService],
})
export class ItemClasificadoModule {}
