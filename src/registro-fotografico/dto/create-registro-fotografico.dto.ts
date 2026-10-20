import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegistroFotograficoDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del lote (si se indica solo el turno, se toma el lote de su donación)' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  loteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del turno' })
  @IsNumber({}, { message: 'El turno debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  turnoId?: number;

  @ApiProperty({ example: 'https://storage.wastech.com/fotos/lote-001.jpg', description: 'URL de la imagen' })
  @IsString({ message: 'La imagen debe ser un texto' })
  urlImagen: string;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del registro' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  @IsOptional()
  fecha?: Date;
}
