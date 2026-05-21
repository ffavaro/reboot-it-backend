import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTurnoDto {
  @ApiProperty({ example: 1, description: 'ID del donante' })
  @IsNumber()
  donanteId: number;

  @ApiProperty({ example: 1, description: 'ID del estado del turno' })
  @IsNumber()
  estadoTurnoId: number;

  @ApiProperty({ example: '2024-06-15T10:00:00Z', description: 'Fecha y hora del turno' })
  @IsDateString()
  fechaHora: Date;

  @ApiPropertyOptional({ example: 'Donación de equipos de oficina' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
