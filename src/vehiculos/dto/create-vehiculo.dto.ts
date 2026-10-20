import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export const TIPOS_COMBUSTIBLE = ['Nafta', 'Diésel', 'GNC', 'Eléctrico', 'Híbrido'] as const;

export class CreateVehiculoDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de vehículo' })
  @IsNumber()
  tipoVehiculoId: number;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  patente: string;

  @ApiProperty({ example: 'Ford' })
  @IsString()
  marca: string;

  @ApiProperty({ example: 'F-100' })
  @IsString()
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
