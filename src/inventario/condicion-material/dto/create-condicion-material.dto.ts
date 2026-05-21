import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCondicionMaterialDto {
  @ApiProperty({ example: 'Funcional' })
  @IsString()
  condicion: string;

  @ApiPropertyOptional({ example: 'Material en condiciones de uso' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
