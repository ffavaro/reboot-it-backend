import { PartialType } from '@nestjs/swagger';
import { CreateCondicionMaterialDto } from './create-condicion-material.dto';

export class UpdateCondicionMaterialDto extends PartialType(CreateCondicionMaterialDto) {}
