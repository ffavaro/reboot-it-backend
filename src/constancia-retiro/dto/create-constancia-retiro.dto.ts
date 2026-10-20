import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConstanciaRetiroDto {
  @ApiProperty({ example: 1, description: 'ID del retiro' })
  @IsNumber({}, { message: 'El retiro debe ser un número' })
  retiroId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha de emisión' })
  @IsDateString({}, { message: 'La fecha de emisión debe ser una fecha válida' })
  @IsOptional()
  fechaEmision?: string;

  @ApiPropertyOptional({ example: 'Material recibido conforme. Sin observaciones.' })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ example: 1, description: 'ID del técnico responsable' })
  @IsNumber({}, { message: 'El técnico debe ser un número' })
  tecnicoId: number;
}
