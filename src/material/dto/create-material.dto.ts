import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaterialDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del lote' })
  @IsNumber()
  @IsOptional()
  loteId?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de material' })
  @IsNumber()
  tipoMaterialId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la condición del material' })
  @IsNumber()
  @IsOptional()
  condicionMaterialId?: number;

  @ApiProperty({ example: 'Notebook Dell Latitude 5490' })
  @IsString()
  descripcion: string;
}
