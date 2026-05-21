import { PartialType } from '@nestjs/swagger';
import { CreateMedioAlmacenamientoDto } from './create-medio-almacenamiento.dto';

export class UpdateMedioAlmacenamientoDto extends PartialType(CreateMedioAlmacenamientoDto) {}
