import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCondicionMaterialDto {
  @ApiProperty({ example: 'Funcional' })
  @IsString({ message: 'La condición debe ser un texto' })
  condicion: string;

  @ApiPropertyOptional({ example: 'Material en condiciones de uso' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;
}
