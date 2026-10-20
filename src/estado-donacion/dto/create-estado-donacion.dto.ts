import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateEstadoDonacionDto {
  @ApiProperty({ example: 'Pendiente' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(50, { message: 'La descripción no puede superar los 50 caracteres' })
  descripcion: string;
}
