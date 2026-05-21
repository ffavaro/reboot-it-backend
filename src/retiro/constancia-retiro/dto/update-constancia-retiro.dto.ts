import { PartialType } from '@nestjs/swagger';
import { CreateConstanciaRetiroDto } from './create-constancia-retiro.dto';

export class UpdateConstanciaRetiroDto extends PartialType(CreateConstanciaRetiroDto) {}
