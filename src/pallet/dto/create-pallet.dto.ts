import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePalletDto {
  @ApiProperty({ example: 1, description: 'ID del rack' })
  @IsNumber({}, { message: 'El rack debe ser un número' })
  rackId: number;

  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  loteId: number;

  @ApiPropertyOptional({ example: 'PLT-001' })
  @IsString({ message: 'El código debe ser un texto' })
  @IsOptional()
  codigo?: string;

  @ApiPropertyOptional({ example: 500.0, description: 'Peso en kg' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsOptional()
  peso_kg?: number;
}
