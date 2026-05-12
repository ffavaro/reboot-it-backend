import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestorAmbiental } from './gestor-ambiental.entity';
import { GestorAmbientalController } from './gestor-ambiental.controller';
import { GestorAmbientalService } from './gestor-ambiental.service';

@Module({
  imports: [TypeOrmModule.forFeature([GestorAmbiental])],
  controllers: [GestorAmbientalController],
  providers: [GestorAmbientalService],
  exports: [GestorAmbientalService],
})
export class GestorAmbientalModule {}
