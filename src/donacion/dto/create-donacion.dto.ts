import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class DetalleInlineDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'El tipo de material debe ser un número entero' })
  @Min(1, { message: 'Seleccioná el tipo de material' })
  tipoMaterialId: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'La condición del material debe ser un número entero' })
  @Min(1, { message: 'Seleccioná la condición del material' })
  condicionMaterialId: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt({ message: 'La cantidad estimada debe ser un número entero' })
  @Min(1, { message: 'La cantidad estimada debe ser como mínimo 1' })
  cantidadEstimada?: number;
}

export class CreateDonacionDto {
  @ApiProperty({ example: 1, description: 'ID del donante' })
  @IsNumber({}, { message: 'El donante debe ser un número' })
  donanteId: number;

  @ApiProperty({ example: '2024-06-15T10:00:00Z', description: 'Fecha y hora del turno a crear' })
  @IsDateString({}, { message: 'La fecha y hora deben ser una fecha válida' })
  fechaHora: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de la donación' })
  @IsNumber({}, { message: 'El estado de la donación debe ser un número' })
  @IsOptional()
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: 'Equipos informáticos en desuso' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean({ message: 'El campo "necesita retiro" debe ser verdadero o falso' })
  @IsOptional()
  necesitaRetiro?: boolean;

  @ApiPropertyOptional({
    example: 'Av. Siempre Viva 742',
    description: 'Dirección de retiro distinta a la registrada en el donante',
  })
  @IsString({ message: 'La dirección de retiro debe ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La dirección de retiro no puede superar los 255 caracteres' })
  direccionRetiro?: string;

  @ApiPropertyOptional({
    example: 25.5,
    description: 'Peso estimado (kg) de la donación, usado para asignar un transportista compatible',
  })
  @IsNumber({}, { message: 'El peso estimado debe ser un número' })
  @IsOptional()
  pesoEstimadoKg?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'URLs de fotos de los materiales (opcional, hasta 5). Quedan asociadas al lote y al turno de la donación.',
  })
  @IsOptional()
  @IsArray({ message: 'Las fotos deben ser una lista' })
  @ArrayMaxSize(5, { message: 'Se pueden cargar hasta 5 fotos' })
  @IsString({ each: true, message: 'Cada foto debe ser un texto (URL)' })
  @MaxLength(255, { each: true, message: 'La URL de cada foto no puede superar los 255 caracteres' })
  fotosUrls?: string[];

  @ApiPropertyOptional({ type: [DetalleInlineDto] })
  @IsOptional()
  @IsArray({ message: 'Los detalles deben ser una lista' })
  @ValidateNested({ each: true })
  @Type(() => DetalleInlineDto)
  detalles?: DetalleInlineDto[];
}
