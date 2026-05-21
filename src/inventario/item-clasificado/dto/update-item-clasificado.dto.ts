import { PartialType } from '@nestjs/swagger';
import { CreateItemClasificadoDto } from './create-item-clasificado.dto';

export class UpdateItemClasificadoDto extends PartialType(CreateItemClasificadoDto) {}
