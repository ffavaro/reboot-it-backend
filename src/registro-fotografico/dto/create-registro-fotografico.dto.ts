import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegistroFotograficoDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del lote' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  loteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del turno' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  turnoId?: number;

  @ApiProperty({ example: 'https://storage.wastech.com/fotos/lote-001.jpg', description: 'URL de la imagen' })
  @IsString()
  urlImagen: string;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del registro' })
  @IsDateString()
  @IsOptional()
  fecha?: Date;
}
