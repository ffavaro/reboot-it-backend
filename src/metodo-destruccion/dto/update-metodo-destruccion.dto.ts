import { PartialType } from '@nestjs/swagger';
import { CreateMetodoDestruccionDto } from './create-metodo-destruccion.dto';

export class UpdateMetodoDestruccionDto extends PartialType(CreateMetodoDestruccionDto) {}
