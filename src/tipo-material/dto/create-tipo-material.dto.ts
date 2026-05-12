import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTipoMaterialDto {
  @ApiProperty({ example: 'Electrónico' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Equipos y componentes electrónicos' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
