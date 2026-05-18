import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConstanciaRetiroDto {
  @ApiProperty({ example: 1, description: 'ID del retiro' })
  @IsNumber()
  retiroId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha de emisión' })
  @IsDateString()
  @IsOptional()
  fechaEmision?: string;

  @ApiPropertyOptional({ example: 'Material recibido conforme. Sin observaciones.' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del técnico responsable' })
  @IsNumber()
  @IsOptional()
  tecnicoId?: number;
}
