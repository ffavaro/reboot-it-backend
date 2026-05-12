import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroFotografico } from './registro-fotografico.entity';
import { RegistroFotograficoController } from './registro-fotografico.controller';
import { RegistroFotograficoService } from './registro-fotografico.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroFotografico])],
  controllers: [RegistroFotograficoController],
  providers: [RegistroFotograficoService],
  exports: [RegistroFotograficoService],
})
export class RegistroFotograficoModule {}
