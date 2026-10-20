import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmpleadoTransportistaDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsNumber()
  empleadoId: number;

  @ApiProperty({ example: 1, description: 'ID del vehículo asignado' })
  @IsNumber()
  vehiculoId: number;

  @ApiPropertyOptional({ example: '2025-06-01T10:00:00Z', description: 'Fecha de asignación' })
  @IsDateString()
  @IsOptional()
  fechaAsignacion?: string;

  @ApiProperty({ example: 'http://localhost:3001/uploads/123-456.jpg', description: 'URL de la foto del carnet de conducir' })
  @IsString()
  @IsNotEmpty({ message: 'La foto del carnet de conducir es obligatoria' })
  @MaxLength(500)
  carnetUrl: string;

  @ApiProperty({ example: '2028-05-20', description: 'Fecha de vencimiento del carnet (yyyy-MM-dd)' })
  @IsDateString({}, { message: 'El vencimiento del carnet debe ser una fecha válida' })
  carnetVencimiento: string;
}
