import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateTipoVehiculoDto {
  @ApiProperty({ example: 'Camión' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(35, { message: 'La descripción no puede superar los 35 caracteres' })
  descripcion: string;

  @ApiPropertyOptional({ example: 10, description: 'Peso mínimo que soporta el vehículo (kg)' })
  @IsNumber({}, { message: 'El peso mínimo debe ser un número' })
  @IsPositive({ message: 'El peso mínimo debe ser mayor a 0' })
  @IsOptional()
  pesoMinimo?: number;

  @ApiProperty({ example: 90, description: 'Peso máximo que soporta el vehículo (kg)' })
  @IsNumber({}, { message: 'El peso máximo debe ser un número' })
  @IsPositive({ message: 'El peso máximo debe ser mayor a 0' })
  pesoMaximo: number;
}
