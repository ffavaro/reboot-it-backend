import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsInt, Max, Min, IsDateString, IsIn } from 'class-validator';
import { KM_MAX } from '../../historial-km-vehiculo/dto/create-historial-km-vehiculo.dto';
export const COMBUSTIBLES = ['Nafta', 'Diésel', 'GNC', 'Eléctrico', 'Híbrido'];

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
  
  @ApiProperty({ example: 85000, description: 'Kilometraje actual del vehículo' })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @Max(KM_MAX, { message: `El kilometraje no puede superar los ${KM_MAX} km` })
  kilometraje: number;

  @ApiProperty({ example: '2027-03-15', description: 'Vencimiento de la ITV (yyyy-MM-dd)' })
  @IsDateString({}, { message: 'El vencimiento de la ITV debe ser una fecha válida' })
  itvVencimiento: string;

  @ApiProperty({ example: 'Nafta', enum: COMBUSTIBLES })
  @IsIn(COMBUSTIBLES, { message: `El combustible debe ser uno de: ${COMBUSTIBLES.join(', ')}` })
  tipoCombustible: string;
}
