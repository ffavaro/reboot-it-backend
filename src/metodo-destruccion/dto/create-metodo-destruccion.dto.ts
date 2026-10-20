import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMetodoDestruccionDto {
  @ApiProperty({ example: 'Trituración física' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Destrucción mediante triturador industrial' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  descripcion?: string;
}
