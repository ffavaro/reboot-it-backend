import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTipoMaterialDto {
  @ApiProperty({ example: 'Electrónico' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Equipos y componentes electrónicos' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion?: string;
}
