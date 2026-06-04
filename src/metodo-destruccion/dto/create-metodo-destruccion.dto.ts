import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMetodoDestruccionDto {
  @ApiProperty({ example: 'Trituración física' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ example: 'Destrucción mediante triturador industrial' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}
