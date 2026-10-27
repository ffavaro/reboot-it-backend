import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';

@Module({
  imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60 * 1000, limit: 60 }] })],
  controllers: [GeoController],
  providers: [GeoService],
})
export class GeoModule {}
