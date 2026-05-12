import { PartialType } from '@nestjs/swagger';
import { CreateProcesoDestruccionDto } from './create-proceso-destruccion.dto';

export class UpdateProcesoDestruccionDto extends PartialType(CreateProcesoDestruccionDto) {}
