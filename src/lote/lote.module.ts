import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from './lote.entity';
import { LoteController } from './lote.controller';
import { LoteService } from './lote.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lote])],
  controllers: [LoteController],
  providers: [LoteService],
  exports: [LoteService],
})
export class LoteModule {}
