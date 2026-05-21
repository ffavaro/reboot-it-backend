import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Acceso completo al sistema' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
