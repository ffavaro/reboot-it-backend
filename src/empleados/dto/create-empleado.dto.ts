import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

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

  @ApiProperty({ example: '30123456', description: 'DNI (8 dígitos) o CUIT (11 dígitos), solo números' })
  @Transform(trim)
  @Matches(/^(\d{8}|\d{11})$/, { message: 'El CUIT/DNI debe tener 8 (DNI) u 11 (CUIT) dígitos numéricos' })
  cuitDni: string;

  @ApiProperty({ example: '2026-01-15', description: 'Fecha de alta (yyyy-MM-dd)' })
  @IsDateString({}, { message: 'La fecha de alta debe ser una fecha válida' })
  fechaAlta: string;

  @ApiProperty({ example: 'Av. Corrientes 1234, CABA' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(255)
  direccion: string;

  @ApiPropertyOptional({ example: '+54 9 11 1234-5678' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Técnico IT' })
  @IsString()
  @IsOptional()
  cargo?: string;
}
