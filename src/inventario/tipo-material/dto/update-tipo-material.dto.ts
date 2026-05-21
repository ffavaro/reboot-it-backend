import { PartialType } from '@nestjs/swagger';
import { CreateTipoMaterialDto } from './create-tipo-material.dto';

export class UpdateTipoMaterialDto extends PartialType(CreateTipoMaterialDto) {}
