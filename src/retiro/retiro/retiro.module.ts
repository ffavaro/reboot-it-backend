import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retiro } from './retiro.entity';
import { RetiroController } from './retiro.controller';
import { RetiroService } from './retiro.service';

@Module({
  imports: [TypeOrmModule.forFeature([Retiro])],
  controllers: [RetiroController],
  providers: [RetiroService],
  exports: [RetiroService],
})
export class RetiroModule {}
