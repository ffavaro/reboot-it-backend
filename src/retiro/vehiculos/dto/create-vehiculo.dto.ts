import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

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
}
