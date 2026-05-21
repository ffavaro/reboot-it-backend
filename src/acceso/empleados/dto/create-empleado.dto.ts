import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEmpleadoDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del usuario asociado' })
  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  rolId: number;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  apellido: string;

  @ApiPropertyOptional({ example: '+54 9 11 1234-5678' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Técnico IT' })
  @IsString()
  @IsOptional()
  cargo?: string;
}
