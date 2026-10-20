import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRetiroDto {
  @ApiProperty({ example: 1, description: 'ID de la donación' })
  @IsNumber({}, { message: 'La donación debe ser un número' })
  donacionId: number;

  @ApiProperty({ example: 1, description: 'ID del empleado transportista' })
  @IsNumber({}, { message: 'El empleado transportista debe ser un número' })
  empleadoTransportistaId: number;

  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsNumber({}, { message: 'El vehículo debe ser un número' })
  vehiculoId: number;

  @ApiPropertyOptional({ example: '2024-06-15T08:00:00Z', description: 'Fecha de inicio del retiro' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsOptional()
  fechaInicio?: Date;

  @ApiPropertyOptional({ example: '2024-06-15T10:00:00Z', description: 'Fecha efectiva del retiro' })
  @IsDateString({}, { message: 'La fecha de retiro debe ser una fecha válida' })
  @IsOptional()
  fechaRetiro?: Date;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234, CABA' })
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  direccion?: string;
}
