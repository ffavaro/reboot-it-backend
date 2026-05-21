import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipo } from './tipo.entity';
import { TipoService } from './tipo.service';
import { TipoController } from './tipo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tipo])],
  controllers: [TipoController],
  providers: [TipoService],
  exports: [TypeOrmModule],
})
export class TipoModule {}
