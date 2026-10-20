import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, Min, ValidateNested } from 'class-validator';
import { ALCANCES } from '../permisos.constants';

const MENSAJE_ALCANCE = `El alcance debe ser uno de: ${ALCANCES.join(', ')}`;

export class PermisoPantallaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'La pantalla debe ser un número entero' })
  @Min(1, { message: 'La pantalla debe ser como mínimo 1' })
  pantallaId: number;

  @ApiProperty({ enum: ALCANCES })
  @IsIn(ALCANCES, { message: MENSAJE_ALCANCE })
  ver: string;

  @ApiProperty({ enum: ALCANCES })
  @IsIn(ALCANCES, { message: MENSAJE_ALCANCE })
  crear: string;

  @ApiProperty({ enum: ALCANCES })
  @IsIn(ALCANCES, { message: MENSAJE_ALCANCE })
  editar: string;

  @ApiProperty({ enum: ALCANCES })
  @IsIn(ALCANCES, { message: MENSAJE_ALCANCE })
  baja: string;
}

export class GuardarPermisosDto {
  @ApiProperty({ type: [PermisoPantallaDto] })
  @IsArray({ message: 'Los permisos deben ser una lista' })
  @ArrayMaxSize(200, { message: 'Hay demasiados permisos en la lista' })
  @ValidateNested({ each: true })
  @Type(() => PermisoPantallaDto)
  permisos: PermisoPantallaDto[];
}
