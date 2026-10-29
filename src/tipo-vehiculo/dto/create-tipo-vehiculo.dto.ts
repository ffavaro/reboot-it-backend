import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTipoVehiculoDto {
  @ApiProperty({ example: 'Camión' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(35, { message: 'La descripción no puede superar los 35 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @ApiPropertyOptional({ example: 10, description: 'Peso mínimo que soporta el vehículo (kg)' })
  @IsNumber({}, { message: 'El peso mínimo debe ser un número' })
  @IsPositive({ message: 'El peso mínimo debe ser mayor a 0' })
  @IsOptional()
  @Max(99999999.99, { message: 'El peso mínimo no puede superar 99999999.99' })
  pesoMinimo?: number;

  @ApiProperty({ example: 90, description: 'Peso máximo que soporta el vehículo (kg)' })
  @IsNumber({}, { message: 'El peso máximo debe ser un número' })
  @IsPositive({ message: 'El peso máximo debe ser mayor a 0' })
  @Max(99999999.99, { message: 'El peso máximo no puede superar 99999999.99' })
  pesoMaximo: number;
}
