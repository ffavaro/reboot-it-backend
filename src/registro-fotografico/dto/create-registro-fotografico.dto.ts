import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRegistroFotograficoDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del lote (si se indica solo el turno, se toma el lote de su donación)' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Seleccioná una opción válida' })
  loteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del turno' })
  @IsNumber({}, { message: 'El turno debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Seleccioná una opción válida' })
  turnoId?: number;

  @ApiProperty({ example: 'https://storage.wastech.com/fotos/lote-001.jpg', description: 'URL de la imagen' })
  @IsString({ message: 'La imagen debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  @MaxLength(300, { message: 'La imagen no puede superar los 300 caracteres' })
  urlImagen: string;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del registro' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  @IsOptional()
  fecha?: Date;
}
