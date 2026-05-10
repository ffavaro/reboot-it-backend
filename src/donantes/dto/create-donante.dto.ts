import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDonanteDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del usuario asociado' })
  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de donante' })
  @IsNumber()
  tipoDonanteId: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Empresa S.A.' })
  @IsString()
  @IsOptional()
  razonSocial?: string;

  @ApiPropertyOptional({ example: '+54 9 11 1234-5678' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234, CABA' })
  @IsString()
  @IsOptional()
  direccion?: string;
}
