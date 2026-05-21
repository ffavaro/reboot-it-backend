import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedioAlmacenamiento } from './medio-almacenamiento.entity';
import { MedioAlmacenamientoController } from './medio-almacenamiento.controller';
import { MedioAlmacenamientoService } from './medio-almacenamiento.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedioAlmacenamiento])],
  controllers: [MedioAlmacenamientoController],
  providers: [MedioAlmacenamientoService],
  exports: [MedioAlmacenamientoService],
})
export class MedioAlmacenamientoModule {}
