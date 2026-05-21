import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber()
  loteId: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de material' })
  @IsNumber()
  tipoMaterialId: number;

  @ApiProperty({ example: 1, description: 'ID de la condición del material' })
  @IsNumber()
  condicionMaterialId: number;

  @ApiPropertyOptional({ example: 'Notebook Dell Latitude 5490' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
