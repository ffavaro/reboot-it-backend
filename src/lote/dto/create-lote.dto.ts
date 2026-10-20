import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLoteDto {
  @ApiProperty({ example: 1, description: 'ID de la donación' })
  @IsNumber({}, { message: 'La donación debe ser un número' })
  donacionId: number;

  @ApiPropertyOptional({ example: 150.5, description: 'Peso bruto en kg' })
  @IsNumber({}, { message: 'El peso bruto debe ser un número' })
  @IsOptional()
  pesoBrutoKg?: number;

  @ApiPropertyOptional({ example: 'Equipos en buen estado general' })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  observaciones?: string;
}
