import { PartialType } from '@nestjs/swagger';
import { CreateDonacionDto } from './create-donacion.dto';

export class UpdateDonacionDto extends PartialType(CreateDonacionDto) {}
