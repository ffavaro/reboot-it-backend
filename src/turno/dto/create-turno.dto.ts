import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTurnoDto {
  @ApiProperty({ example: 1, description: 'ID del donante' })
  @IsNumber({}, { message: 'El donante debe ser un número' })
  donanteId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la donación asociada' })
  @IsNumber({}, { message: 'La donación debe ser un número' })
  @IsOptional()
  donacionId?: number;

  @ApiProperty({ example: 1, description: 'ID del estado del turno' })
  @IsNumber({}, { message: 'El estado del turno debe ser un número' })
  estadoTurnoId: number;

  @ApiProperty({ example: '2024-06-15T10:00:00Z', description: 'Fecha y hora del turno' })
  @IsDateString({}, { message: 'La fecha y hora deben ser una fecha válida' })
  fechaHora: Date;

  @ApiPropertyOptional({ example: 'Donación de equipos de oficina' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: false, description: 'Indica si el turno requiere retiro a domicilio' })
  @IsBoolean({ message: 'El campo "necesita retiro" debe ser verdadero o falso' })
  @IsOptional()
  necesitaRetiro?: boolean;
}
