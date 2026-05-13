import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadoDisposicion } from './certificado-disposicion.entity';
import { CertificadoDisposicionController } from './certificado-disposicion.controller';
import { CertificadoDisposicionService } from './certificado-disposicion.service';

@Module({
  imports: [TypeOrmModule.forFeature([CertificadoDisposicion])],
  controllers: [CertificadoDisposicionController],
  providers: [CertificadoDisposicionService],
  exports: [CertificadoDisposicionService],
})
export class CertificadoDisposicionModule {}
