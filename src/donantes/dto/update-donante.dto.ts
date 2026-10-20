import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDonanteDto } from './create-donante.dto';

// Los datos del usuario a crear solo se envían al dar de alta al donante
export class UpdateDonanteDto extends PartialType(OmitType(CreateDonanteDto, ['usuario'] as const)) {}
