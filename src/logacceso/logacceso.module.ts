import { Module } from '@nestjs/common';
import { LogaccesoService } from './logacceso.service';
import { LogaccesoController } from './logacceso.controller';

@Module({
  controllers: [LogaccesoController],
  providers: [LogaccesoService],
})
export class LogaccesoModule {}
