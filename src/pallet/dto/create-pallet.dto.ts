import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePalletDto {
  @ApiProperty({ example: 1, description: 'ID del rack' })
  @IsNumber()
  rackId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del lote' })
  @IsNumber()
  @IsOptional()
  loteId?: number;

  @ApiPropertyOptional({ example: 'PLT-001' })
  @IsString()
  @IsOptional()
  codigo?: string;

  @ApiPropertyOptional({ example: 500.0, description: 'Peso en kg' })
  @IsNumber()
  @IsOptional()
  peso_kg?: number;
}
