import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateTipoVehiculoDto {
  @ApiProperty({ example: 'Camión' })
  @IsString()
  @MaxLength(35)
  descripcion: string;

  @ApiPropertyOptional({ example: 10, description: 'Peso mínimo que soporta el vehículo (kg)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pesoMinimo?: number;

  @ApiPropertyOptional({ example: 90, description: 'Peso máximo que soporta el vehículo (kg)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pesoMaximo?: number;
}
