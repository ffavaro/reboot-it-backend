import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConstanciaRetiroDto {
  @ApiProperty({ example: 1, description: 'ID del retiro' })
  @IsNumber()
  retiroId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha de emisión' })
  @IsDateString()
  @IsOptional()
  fechaEmision?: Date;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de archivo' })
  @IsDateString()
  @IsOptional()
  fechaArchivo?: Date;

  @ApiPropertyOptional({ example: 'https://storage.wastech.com/constancias/CR-001.pdf' })
  @IsString()
  @IsOptional()
  archivoUrl?: string;
}
