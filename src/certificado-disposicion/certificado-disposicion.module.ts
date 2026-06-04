import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadoDisposicion } from './certificado-disposicion.entity';
import { Lote } from '../lote/lote.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { CertificadoDisposicionController } from './certificado-disposicion.controller';
import { CertificadoDisposicionService } from './certificado-disposicion.service';

@Module({
  imports: [TypeOrmModule.forFeature([CertificadoDisposicion, Lote, Donacion, EstadoDonacion])],
  controllers: [CertificadoDisposicionController],
  providers: [CertificadoDisposicionService],
  exports: [CertificadoDisposicionService],
})
export class CertificadoDisposicionModule {}
