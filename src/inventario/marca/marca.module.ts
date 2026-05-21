import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marca } from './marca.entity';
import { MarcaService } from './marca.service';
import { MarcaController } from './marca.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Marca])],
  controllers: [MarcaController],
  providers: [MarcaService],
  exports: [TypeOrmModule],
})
export class MarcaModule {}
