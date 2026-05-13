import { PartialType } from '@nestjs/swagger';
import { CreateCertificadoDisposicionDto } from './create-certificado-disposicion.dto';

export class UpdateCertificadoDisposicionDto extends PartialType(CreateCertificadoDisposicionDto) {}
