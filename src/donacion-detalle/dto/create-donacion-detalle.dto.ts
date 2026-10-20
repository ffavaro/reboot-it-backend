import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateDonacionDetalleDto {
  @ApiProperty()
  @IsInt({ message: 'La donación debe ser un número entero' })
  donacionId: number;

  @ApiProperty()
  @IsInt({ message: 'El tipo de material debe ser un número entero' })
  tipoMaterialId: number;

  @ApiProperty()
  @IsInt({ message: 'La condición del material debe ser un número entero' })
  condicionMaterialId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt({ message: 'La cantidad estimada debe ser un número entero' })
  @Min(1, { message: 'La cantidad estimada debe ser como mínimo 1' })
  cantidadEstimada?: number;
}
