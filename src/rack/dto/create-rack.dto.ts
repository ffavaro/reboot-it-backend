import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRackDto {
  @ApiProperty({ example: 'RACK-A01' })
  @IsString({ message: 'El código debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
  codigo: string;

  @ApiProperty({ example: 'Depósito B - Fila 1' })
  @IsString({ message: 'La ubicación debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La ubicación es obligatoria' })
  @MaxLength(150, { message: 'La ubicación no puede superar los 150 caracteres' })
  ubicacion: string;
}
