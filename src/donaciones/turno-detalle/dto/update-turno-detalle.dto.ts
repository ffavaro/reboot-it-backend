import { PartialType } from '@nestjs/swagger';
import { CreateTurnoDetalleDto } from './create-turno-detalle.dto';

export class UpdateTurnoDetalleDto extends PartialType(CreateTurnoDetalleDto) {}
