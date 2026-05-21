import { PartialType } from '@nestjs/swagger';
import { CreateEstadoTurnoDto } from './create-estado-turno.dto';

export class UpdateEstadoTurnoDto extends PartialType(CreateEstadoTurnoDto) {}
