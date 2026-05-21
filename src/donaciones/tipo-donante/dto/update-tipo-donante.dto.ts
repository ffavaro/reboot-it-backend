import { PartialType } from '@nestjs/swagger';
import { CreateTipoDonanteDto } from './create-tipo-donante.dto';

export class UpdateTipoDonanteDto extends PartialType(CreateTipoDonanteDto) {}
