import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donante } from './donante.entity';
import { DonantesController } from './donantes.controller';
import { DonantesService } from './donantes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donante])],
  controllers: [DonantesController],
  providers: [DonantesService],
  exports: [DonantesService],
})
export class DonantesModule {}
