import { PartialType } from '@nestjs/swagger';
import { CreateGestorAmbientalDto } from './create-gestor-ambiental.dto';

export class UpdateGestorAmbientalDto extends PartialType(CreateGestorAmbientalDto) {}
