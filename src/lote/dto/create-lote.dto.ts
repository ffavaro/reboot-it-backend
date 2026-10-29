import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLoteDto {
  @ApiProperty({ example: 1, description: 'ID de la donación' })
  @IsNumber({}, { message: 'La donación debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  donacionId: number;

  @ApiPropertyOptional({ example: 150.5, description: 'Peso bruto en kg' })
  @IsNumber({}, { message: 'El peso bruto debe ser un número' })
  @IsOptional()
  @IsPositive({ message: 'El peso bruto debe ser mayor a 0' })
  @Max(99999999.99, { message: 'El peso bruto no puede superar 99999999.99' })
  pesoBrutoKg?: number;

  @ApiPropertyOptional({ example: 'Equipos en buen estado general' })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(300, { message: 'Las observaciones no pueden superar los 300 caracteres' })
  observaciones?: string;
}
