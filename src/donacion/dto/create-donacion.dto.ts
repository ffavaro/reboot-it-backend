import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDonacionDto {
  @ApiProperty({ example: 1, description: 'ID del donante' })
  @IsNumber()
  donanteId: number;

  @ApiProperty({ example: '2024-06-15T10:00:00Z', description: 'Fecha y hora del turno a crear' })
  @IsDateString()
  fechaHora: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de la donación' })
  @IsNumber()
  @IsOptional()
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: 'Equipos informáticos en desuso' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
