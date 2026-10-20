import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmpleadoTransportistaDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber({}, { message: 'El empleado debe ser un número' })
  empleadoId: number;

  @ApiProperty({ example: 1, description: 'ID del vehículo asignado' })
  @IsNumber({}, { message: 'El vehículo debe ser un número' })
  vehiculoId: number;

  @ApiPropertyOptional({ example: '2025-06-01T10:00:00Z', description: 'Fecha de asignación' })
  @IsDateString({}, { message: 'La fecha de asignación debe ser una fecha válida' })
  @IsOptional()
  fechaAsignacion?: string;

  @ApiProperty({ example: 'http://localhost:3001/uploads/123-456.jpg', description: 'URL de la foto del carnet de conducir' })
  @IsString({ message: 'La foto del carnet debe ser un texto' })
  @IsNotEmpty({ message: 'La foto del carnet de conducir es obligatoria' })
  @MaxLength(500, { message: 'La foto del carnet no puede superar los 500 caracteres' })
  carnetUrl: string;

  @ApiProperty({ example: '2028-05-20', description: 'Fecha de vencimiento del carnet (yyyy-MM-dd)' })
  @IsDateString({}, { message: 'El vencimiento del carnet debe ser una fecha válida' })
  carnetVencimiento: string;
}
