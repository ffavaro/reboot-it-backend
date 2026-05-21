import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLoteDto {
  @ApiProperty({ example: 1, description: 'ID de la donación' })
  @IsNumber()
  donacionId: number;

  @ApiPropertyOptional({ example: 150.5, description: 'Peso bruto en kg' })
  @IsNumber()
  @IsOptional()
  pesoBrutoKg?: number;

  @ApiPropertyOptional({ example: 'Equipos en buen estado general' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
