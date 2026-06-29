import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteProcesoDestruccionDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del estado del proceso' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del método de destrucción' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  metodoDestruccionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado responsable' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empleadoId?: number;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de proceso desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de proceso hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
