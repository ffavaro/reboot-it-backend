import { PartialType } from '@nestjs/swagger';
import { CreatePantallaDto } from './create-pantalla.dto';

export class UpdatePantallaDto extends PartialType(CreatePantallaDto) {}
