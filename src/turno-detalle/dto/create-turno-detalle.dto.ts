import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTurnoDetalleDto {
  @ApiProperty()
  @IsInt({ message: 'El turno debe ser un número entero' })
  turnoId: number;

  @ApiProperty()
  @IsInt({ message: 'El detalle de la donación debe ser un número entero' })
  donacionDetalleId: number;

  @ApiProperty()
  @IsInt({ message: 'El tipo de material debe ser un número entero' })
  tipoMaterialId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt({ message: 'La cantidad confirmada debe ser un número entero' })
  @Min(0, { message: 'La cantidad confirmada debe ser como mínimo 0' })
  cantidadConfirmada?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;
}
