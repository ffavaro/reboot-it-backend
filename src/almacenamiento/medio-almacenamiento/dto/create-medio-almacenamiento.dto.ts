import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedioAlmacenamientoDto {
  @ApiProperty({ example: 1, description: 'ID del material' })
  @IsNumber()
  materialId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del tipo de medio' })
  @IsNumber()
  @IsOptional()
  tipoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la marca' })
  @IsNumber()
  @IsOptional()
  marcaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del modelo' })
  @IsNumber()
  @IsOptional()
  modeloId?: number;

  @ApiPropertyOptional({ example: 'Uso en ambiente seco' })
  @IsString()
  @IsOptional()
  terminosUso?: string;
}
