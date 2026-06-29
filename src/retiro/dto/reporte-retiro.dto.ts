import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteRetiroDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del donante' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  donanteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado transportista' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empleadoTransportistaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de la donación' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de inicio del retiro desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de inicio del retiro hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
