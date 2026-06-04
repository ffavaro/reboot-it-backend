import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class AsignarEmpleadoDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del empleado (para turnos sin retiro)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  empleadoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado transportista (para turnos con retiro)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  empleadoTransportistaId?: number;
}
