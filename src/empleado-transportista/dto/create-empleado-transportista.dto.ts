import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateEmpleadoTransportistaDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber()
  empleadoId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del vehículo asignado' })
  @IsNumber()
  @IsOptional()
  vehiculoId?: number;

  @ApiPropertyOptional({ example: false, description: 'Indica si tiene una asignación activa' })
  @IsBoolean()
  @IsOptional()
  tieneAsignacion?: boolean;
}
