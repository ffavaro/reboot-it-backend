import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteRetiroDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del donante' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El donante debe ser un número entero' })
  donanteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado transportista' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El empleado transportista debe ser un número entero' })
  empleadoTransportistaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de la donación' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El estado de la donación debe ser un número entero' })
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de inicio del retiro desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de inicio del retiro hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  fechaHasta?: string;
}
