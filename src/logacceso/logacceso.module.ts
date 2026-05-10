import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAcceso } from './logacceso.entity';
import { LogAccesoController } from './logacceso.controller';
import { LogAccesoService } from './logacceso.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogAcceso])],
  controllers: [LogAccesoController],
  providers: [LogAccesoService],
  exports: [LogAccesoService],
})
export class LogAccesoModule {}
