import { PartialType } from '@nestjs/swagger';
import { CreateEstadoDonacionDto } from './create-estado-donacion.dto';

export class UpdateEstadoDonacionDto extends PartialType(CreateEstadoDonacionDto) {}
