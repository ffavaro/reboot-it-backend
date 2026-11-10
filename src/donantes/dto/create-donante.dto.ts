import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @IsIn(['Nacional', 'Provincial', 'Municipal'])
  jurisdiccion?:string | null
  
  @IsString()
  @IsOptional()
  @MaxLength(100)
  responsable?:string | null
  
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoResponsable?:string | null
}
