import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteMaterialDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del tipo de material' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El tipo de material debe ser un número entero' })
  tipoMaterialId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la condición del material' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La condición del material debe ser un número entero' })
  condicionMaterialId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del lote' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El lote debe ser un número entero' })
  loteId?: number;

  @ApiPropertyOptional({ example: true, description: 'true = con proceso de destrucción, false = sin proceso' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean({ message: 'El campo "tiene destrucción" debe ser verdadero o falso' })
  tieneDestruccion?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de registro desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de registro hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  fechaHasta?: string;
}
