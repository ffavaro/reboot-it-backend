import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteProcesoDestruccionDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del estado del proceso' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El estado debe ser un número entero' })
  estadoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del método de destrucción' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El método de destrucción debe ser un número entero' })
  metodoDestruccionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado responsable' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El empleado debe ser un número entero' })
  empleadoId?: number;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de proceso desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de proceso hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  fechaHasta?: string;
}
