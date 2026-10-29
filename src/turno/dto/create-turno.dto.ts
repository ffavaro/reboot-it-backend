import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTurnoDto {
  @ApiProperty({ example: 1, description: 'ID del donante' })
  @IsNumber({}, { message: 'El donante debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  donanteId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la donación asociada' })
  @IsNumber({}, { message: 'La donación debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  donacionId?: number;

  @ApiProperty({ example: 1, description: 'ID del estado del turno' })
  @IsNumber({}, { message: 'El estado del turno debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  estadoTurnoId: number;

  @ApiProperty({ example: '2024-06-15T10:00:00Z', description: 'Fecha y hora del turno' })
  @IsDateString({}, { message: 'La fecha y hora deben ser una fecha válida' })
  fechaHora: Date;

  @ApiPropertyOptional({ example: 'Donación de equipos de oficina' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({ example: false, description: 'Indica si el turno requiere retiro a domicilio' })
  @IsBoolean({ message: 'El campo "necesita retiro" debe ser verdadero o falso' })
  @IsOptional()
  necesitaRetiro?: boolean;
}
