import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

// Acepta fechaDesde/fechaHasta (convención del proyecto) y fecha_desde/fecha_hasta como alias
export class RangoFechasQueryDto {
  @ApiPropertyOptional({ example: '2026-10-01', description: 'yyyy-MM-dd' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaDesde debe ser una fecha válida (yyyy-MM-dd)' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'yyyy-MM-dd' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaHasta debe ser una fecha válida (yyyy-MM-dd)' })
  fechaHasta?: string;

  @ApiPropertyOptional({ description: 'Alias de fechaDesde' })
  @IsOptional()
  @IsDateString({}, { message: 'fecha_desde debe ser una fecha válida (yyyy-MM-dd)' })
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'Alias de fechaHasta' })
  @IsOptional()
  @IsDateString({}, { message: 'fecha_hasta debe ser una fecha válida (yyyy-MM-dd)' })
  fecha_hasta?: string;
}

export class ReporteUsoVehiculosQueryDto extends RangoFechasQueryDto {
  @ApiPropertyOptional({ example: 10, description: 'Cantidad máxima de vehículos (top N)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser como mínimo 1' })
  @Max(100, { message: 'El límite debe ser como máximo 100' })
  limit?: number;
}

export class ListarHistorialQueryDto extends RangoFechasQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por vehículo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El vehículo debe ser un número entero' })
  @Min(1, { message: 'El vehículo debe ser como mínimo 1' })
  vehiculoId?: number;
}

export type RangoFechas = { desde?: string; hasta?: string };
