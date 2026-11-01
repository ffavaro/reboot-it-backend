import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const KM_MAX = 9999999;

export class CreateHistorialKmVehiculoDto {
  @IsInt({ message: 'El vehículo es obligatorio' })
  @Min(1, { message: 'El vehículo es obligatorio' })
  vehiculoId: number;

  @IsInt({ message: 'El kilometraje inicial debe ser un número entero' })
  @Min(0, { message: 'El kilometraje inicial no puede ser negativo' })
  @Max(KM_MAX, { message: `El kilometraje inicial no puede superar los ${KM_MAX} km` })
  kmInicial: number;

  @IsOptional()
  @IsInt({ message: 'El kilometraje final debe ser un número entero' })
  @Min(0, { message: 'El kilometraje final no puede ser negativo' })
  @Max(KM_MAX, { message: `El kilometraje final no puede superar los ${KM_MAX} km` })
  kmFinal?: number;
}