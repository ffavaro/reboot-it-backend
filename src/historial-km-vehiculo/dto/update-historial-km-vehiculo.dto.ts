import { PartialType } from '@nestjs/swagger';
import { CreateHistorialKmVehiculoDto } from './create-historial-km-vehiculo.dto';

export class UpdateHistorialKmVehiculoDto extends PartialType(CreateHistorialKmVehiculoDto) {}
