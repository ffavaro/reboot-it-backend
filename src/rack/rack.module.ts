import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rack } from './rack.entity';
import { RackController } from './rack.controller';
import { RackService } from './rack.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rack])],
  controllers: [RackController],
  providers: [RackService],
  exports: [RackService],
})
export class RackModule {}
