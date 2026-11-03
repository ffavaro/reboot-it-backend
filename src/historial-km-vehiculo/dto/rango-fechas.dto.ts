import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class RangoFechasDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaDesde debe ser una fecha válida (yyyy-MM-dd)' },
  )
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaHasta debe ser una fecha válida (yyyy-MM-dd)' },
  )
  fechaHasta?: string;
}

export class ReporteUsoDto extends RangoFechasDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser como mínimo 1' })
  @Max(100, { message: 'El límite debe ser como máximo 100' })
  limite?: number;
}