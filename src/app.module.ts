import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configBase } from './database/config';

@Module({
  imports: [configBase],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
