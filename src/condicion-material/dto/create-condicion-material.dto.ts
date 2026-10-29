import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCondicionMaterialDto {
  @ApiProperty({ example: 'Funcional' })
  @IsString({ message: 'La condición debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La condición es obligatoria' })
  @MaxLength(100, { message: 'La condición no puede superar los 100 caracteres' })
  condicion: string;

  @ApiPropertyOptional({ example: 'Material en condiciones de uso' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion?: string;
}
