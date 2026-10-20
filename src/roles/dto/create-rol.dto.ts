import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Acceso completo al sistema' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;
}
