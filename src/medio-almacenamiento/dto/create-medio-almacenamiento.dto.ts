import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedioAlmacenamientoDto {
  @ApiProperty({ example: 1, description: 'ID del material' })
  @IsNumber()
  materialId: number;

  @ApiPropertyOptional({ example: 'Pallet' })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({ example: 'Genérico' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({ example: 'Estándar 1200x1000' })
  @IsString()
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional({ example: 'Uso en ambiente seco' })
  @IsString()
  @IsOptional()
  terminosUso?: string;
}
