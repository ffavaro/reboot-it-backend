import { PartialType } from '@nestjs/swagger';
import { CreateRolPermisoDto } from './create-rol-permiso.dto';

export class UpdateRolPermisoDto extends PartialType(CreateRolPermisoDto) {}
