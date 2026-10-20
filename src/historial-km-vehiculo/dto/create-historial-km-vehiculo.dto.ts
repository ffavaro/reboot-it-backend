import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const KM_MAX = 9999999;

export class CreateHistorialKmVehiculoDto {
  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsInt({ message: 'El vehículo es obligatorio' })
  @Min(1, { message: 'El vehículo es obligatorio' })
  vehiculoId: number;

  @ApiProperty({ example: 85000, description: 'Kilometraje al iniciar el recorrido' })
  @IsInt({ message: 'El kilometraje inicial debe ser un número entero' })
  @Min(0, { message: 'El kilometraje inicial no puede ser negativo' })
  @Max(KM_MAX, { message: `El kilometraje inicial no puede superar los ${KM_MAX} km` })
  kmInicial: number;

  @ApiPropertyOptional({ example: 85120, description: 'Kilometraje al finalizar (debe ser mayor o igual al inicial)' })
  @IsOptional()
  @IsInt({ message: 'El kilometraje final debe ser un número entero' })
  @Min(0, { message: 'El kilometraje final no puede ser negativo' })
  @Max(KM_MAX, { message: `El kilometraje final no puede superar los ${KM_MAX} km` })
  kmFinal?: number;
}
