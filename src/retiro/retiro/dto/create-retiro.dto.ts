import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRetiroDto {
  @ApiProperty({ example: 1, description: 'ID de la donación' })
  @IsNumber()
  donacionId: number;

  @ApiProperty({ example: 1, description: 'ID del empleado transportista' })
  @IsNumber()
  empleadoTransportistaId: number;

  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsNumber()
  vehiculoId: number;

  @ApiPropertyOptional({ example: '2024-06-15T08:00:00Z', description: 'Fecha de inicio del retiro' })
  @IsDateString()
  @IsOptional()
  fechaInicio?: Date;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234, CABA' })
  @IsString()
  @IsOptional()
  direccion?: string;
}
