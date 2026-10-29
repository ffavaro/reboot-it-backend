import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEstadoProcesoDestruccionDto {
  @ApiProperty({ example: 'Pendiente' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'En espera de ejecución o recursos' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion?: string;
}
