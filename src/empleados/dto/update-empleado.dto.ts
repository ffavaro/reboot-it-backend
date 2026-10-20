import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './create-empleado.dto';

// El email y la contraseña se cargan solo al crear al empleado (se usan para crear su usuario)
export class UpdateEmpleadoDto extends PartialType(OmitType(CreateEmpleadoDto, ['email', 'password'] as const)) {}
