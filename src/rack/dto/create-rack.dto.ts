import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRackDto {
  @ApiProperty({ example: 'RACK-A01' })
  @IsString()
  codigo: string;

  @ApiPropertyOptional({ example: 'Depósito B - Fila 1' })
  @IsString()
  @IsOptional()
  ubicacion?: string;
}
