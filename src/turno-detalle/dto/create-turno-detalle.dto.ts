import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTurnoDetalleDto {
  @ApiProperty()
  @IsInt({ message: 'El turno debe ser un número entero' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  turnoId: number;

  @ApiProperty()
  @IsInt({ message: 'El detalle de la donación debe ser un número entero' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  donacionDetalleId: number;

  @ApiProperty()
  @IsInt({ message: 'El tipo de material debe ser un número entero' })
  @Min(1, { message: 'Seleccioná una opción válida' })
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
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(255, { message: 'Las observaciones no pueden superar los 255 caracteres' })
  observaciones?: string;
}
