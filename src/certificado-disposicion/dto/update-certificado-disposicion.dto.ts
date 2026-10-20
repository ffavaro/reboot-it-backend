import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCertificadoDisposicionDto } from './create-certificado-disposicion.dto';

// El certificado de disposición final adjunto queda fijo desde que se crea el certificado
export class UpdateCertificadoDisposicionDto extends PartialType(OmitType(CreateCertificadoDisposicionDto, ['archivoFinalUrl'] as const)) {}
