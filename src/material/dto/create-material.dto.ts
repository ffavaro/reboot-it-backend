import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaterialDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del lote' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  loteId?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de material' })
  @IsNumber({}, { message: 'El tipo de material debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  tipoMaterialId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la condición del material' })
  @IsNumber({}, { message: 'La condición del material debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  condicionMaterialId?: number;

  @ApiProperty({ example: 'Notebook Dell Latitude 5490' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion: string;
}
