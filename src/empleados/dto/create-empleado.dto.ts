import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateEmpleadoDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del usuario asociado' })
  @IsNumber({}, { message: 'El usuario debe ser un número' })
  @IsOptional()
  usuarioId?: number;

  @ApiProperty({ example: 2 })
  @IsNumber({}, { message: 'El rol debe ser un número' })
  rolId: number;

  @ApiProperty({ example: 'Juan' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString({ message: 'El apellido debe ser un texto' })
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
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(255, { message: 'La dirección no puede superar los 255 caracteres' })
  direccion: string;

  @ApiPropertyOptional({ example: '+54 9 11 1234-5678' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Técnico IT' })
  @IsString({ message: 'El cargo debe ser un texto' })
  @IsOptional()
  cargo?: string;
}
