import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedioAlmacenamientoDto {
  @ApiProperty({ example: 1, description: 'ID del material' })
  @IsNumber({}, { message: 'El material debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  materialId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del tipo de medio' })
  @IsNumber({}, { message: 'El tipo debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  tipoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la marca' })
  @IsNumber({}, { message: 'La marca debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  marcaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del modelo' })
  @IsNumber({}, { message: 'El modelo debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  modeloId?: number;

  @ApiPropertyOptional({ example: 'Uso en ambiente seco' })
  @IsString({ message: 'Los términos de uso deben ser un texto' })
  @IsOptional()
  terminosUso?: string;
}
