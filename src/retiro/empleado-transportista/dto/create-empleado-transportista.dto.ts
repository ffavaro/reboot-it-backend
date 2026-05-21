import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateEmpleadoTransportistaDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber()
  empleadoId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del vehículo asignado' })
  @IsNumber()
  @IsOptional()
  vehiculoId?: number;

  @ApiPropertyOptional({ example: '2025-06-01T10:00:00Z', description: 'Fecha de asignación' })
  @IsDateString()
  @IsOptional()
  fechaAsignacion?: string;
}
