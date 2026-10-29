import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEstadoDonacionDto {
  @ApiProperty({ example: 'Pendiente' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(50, { message: 'La descripción no puede superar los 50 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(50, { message: 'La descripción no puede superar los 50 caracteres' })
  descripcion: string;
}
