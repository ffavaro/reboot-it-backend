import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export const TIPOS_COMBUSTIBLE = ['Nafta', 'Diésel', 'GNC', 'Eléctrico', 'Híbrido'] as const;

export class CreateVehiculoDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de vehículo' })
  @IsNumber({}, { message: 'El tipo de vehículo debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  tipoVehiculoId: number;

  @ApiProperty({ example: 'ABC123' })
  @IsString({ message: 'La patente debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La patente es obligatoria' })
  @MaxLength(20, { message: 'La patente no puede superar los 20 caracteres' })
  @Matches(/^([A-Za-z]{3} ?\d{3}|[A-Za-z]{2} ?\d{3} ?[A-Za-z]{2})$/, { message: 'La patente debe tener formato ABC123 o AB123CD' })
  patente: string;

  @ApiProperty({ example: 'Ford' })
  @IsString({ message: 'La marca debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @MaxLength(50, { message: 'La marca no puede superar los 50 caracteres' })
  marca: string;

  @ApiProperty({ example: 'F-100' })
  @IsString({ message: 'El modelo debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  @MaxLength(50, { message: 'El modelo no puede superar los 50 caracteres' })
  modelo: string;

  @ApiProperty({ example: '2027-03-15', description: 'Fecha de vencimiento de la ITV (yyyy-MM-dd)' })
  @IsDateString({}, { message: 'El vencimiento de la ITV debe ser una fecha válida' })
  itvVencimiento: string;

  @ApiProperty({ example: 85000, description: 'Kilometraje actual' })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @Max(9999999, { message: 'El kilometraje no puede superar los 9.999.999 km' })
  kilometraje: number;

  @ApiProperty({ example: 'Nafta', enum: TIPOS_COMBUSTIBLE })
  @IsIn(TIPOS_COMBUSTIBLE, { message: `El tipo de combustible debe ser uno de: ${TIPOS_COMBUSTIBLE.join(', ')}` })
  tipoCombustible: string;
}
