import { PartialType } from '@nestjs/swagger';
import { CreateEstadoProcesoDestruccionDto } from './create-estado-proceso-destruccion.dto';

export class UpdateEstadoProcesoDestruccionDto extends PartialType(CreateEstadoProcesoDestruccionDto) {}
