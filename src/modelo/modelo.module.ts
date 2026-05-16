import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modelo } from './modelo.entity';
import { ModeloService } from './modelo.service';
import { ModeloController } from './modelo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Modelo])],
  controllers: [ModeloController],
  providers: [ModeloService],
  exports: [TypeOrmModule],
})
export class ModeloModule {}
