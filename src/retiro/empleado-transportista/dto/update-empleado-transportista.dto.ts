import { PartialType } from '@nestjs/swagger';
import { CreateEmpleadoTransportistaDto } from './create-empleado-transportista.dto';

export class UpdateEmpleadoTransportistaDto extends PartialType(CreateEmpleadoTransportistaDto) {}
