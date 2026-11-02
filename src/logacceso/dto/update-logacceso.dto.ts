import { PartialType } from '@nestjs/swagger';
import { CreateLogaccesoDto } from './create-logacceso.dto';

export class UpdateLogaccesoDto extends PartialType(CreateLogaccesoDto) {}
