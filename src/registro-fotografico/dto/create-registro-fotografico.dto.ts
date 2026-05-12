import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegistroFotograficoDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber()
  loteId: number;

  @ApiProperty({ example: 'https://storage.wastech.com/fotos/lote-001.jpg', description: 'URL de la imagen' })
  @IsString()
  urlImagen: string;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del registro' })
  @IsDateString()
  @IsOptional()
  fecha?: Date;
}
