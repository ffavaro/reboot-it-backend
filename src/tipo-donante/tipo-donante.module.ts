import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDonante } from './tipo-donante.entity';
import { TipoDonanteController } from './tipo-donante.controller';
import { TipoDonanteService } from './tipo-donante.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDonante])],
  controllers: [TipoDonanteController],
  providers: [TipoDonanteService],
  exports: [TipoDonanteService],
})
export class TipoDonanteModule {}
