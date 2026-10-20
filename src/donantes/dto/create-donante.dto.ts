import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDonanteDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del usuario asociado' })
  @IsNumber({}, { message: 'El usuario debe ser un número' })
  @IsOptional()
  usuarioId?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de donante' })
  @IsNumber({}, { message: 'El tipo de donante debe ser un número' })
  tipoDonanteId: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Empresa S.A.' })
  @IsString({ message: 'La razón social debe ser un texto' })
  @IsOptional()
  razonSocial?: string;

  @ApiPropertyOptional({ example: '+54 9 11 1234-5678' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234, CABA' })
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  direccion?: string;
}
