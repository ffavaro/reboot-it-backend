import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePalletDto {
  @ApiProperty({ example: 1, description: 'ID del rack' })
  @IsNumber({}, { message: 'El rack debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  rackId: number;

  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  loteId: number;

  @ApiPropertyOptional({ example: 'PLT-001' })
  @IsString({ message: 'El código debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
  codigo?: string;

  @ApiPropertyOptional({ example: 500.0, description: 'Peso en kg' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser mayor a 0' })
  @IsOptional()
  @Max(99999999.99, { message: 'El peso no puede superar 99999999.99' })
  peso_kg?: number;
}
