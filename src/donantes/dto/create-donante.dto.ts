import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export const JURISDICCIONES = ['Nacional', 'Provincial', 'Municipal'];

// Datos del usuario que se crea junto con el donante (rol Donante, con el nombre del donante)
export class DatosUsuarioDonanteDto {
  @ApiProperty({ example: 'juan@email.com', description: 'Email con el que el donante inicia sesión' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'clave123', minLength: 6, description: 'Contraseña inicial del usuario' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(12, { message: 'La contraseña no puede superar los 12 caracteres' })
  password: string;

  @ApiProperty({ example: '30123456', description: 'DNI (8 dígitos) o CUIT (11 dígitos), solo números' })
  @Matches(/^(\d{8}|\d{11})$/, { message: 'El CUIT/DNI debe tener 8 (DNI) u 11 (CUIT) dígitos numéricos' })
  cuitDni: string;
}

export class CreateDonanteDto {
  @ApiPropertyOptional({ example: 1, description: 'ID de un usuario ya existente (lo usa el registro público, que crea el usuario primero)' })
  @IsNumber({}, { message: 'El usuario debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  usuarioId?: number;

  @ApiPropertyOptional({
    type: DatosUsuarioDonanteDto,
    description: 'Datos para crear el usuario del donante en el mismo paso. Hay que enviar estos datos o usuarioId.',
  })
  @IsOptional()
  @ValidateNested({ message: 'Los datos del usuario no son válidos' })
  @Type(() => DatosUsuarioDonanteDto)
  usuario?: DatosUsuarioDonanteDto;

  @ApiProperty({ example: 1, description: 'ID del tipo de donante' })
  @IsNumber({}, { message: 'El tipo de donante debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  tipoDonanteId: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Empresa S.A.' })
  @IsString({ message: 'La razón social debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150, { message: 'La razón social no puede superar los 150 caracteres' })
  razonSocial?: string;

  @ApiPropertyOptional({ example: '+54 9 11 1234-5678' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(20, { message: 'El teléfono no puede superar los 20 caracteres' })
  @Matches(/^(?:54)?9?[1-9]\d{9}$/, { message: 'El teléfono debe ser un número argentino válido: código de área + número, 10 dígitos (ej. 1123456789)' })
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234, CABA' })
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(255, { message: 'La dirección no puede superar los 255 caracteres' })
  direccion?: string;

  @ApiPropertyOptional({ example: 'Provincial', enum: JURISDICCIONES, description: 'Solo organismos públicos' })
  @IsIn(JURISDICCIONES, { message: 'La jurisdicción debe ser Nacional, Provincial o Municipal' })
  @IsOptional()
  jurisdiccion?: string;

  @ApiPropertyOptional({ example: 'Gómez Laura', description: 'Responsable a cargo (apellido y nombre). Solo organismos públicos' })
  @IsString({ message: 'El responsable debe ser un texto' })
  @MaxLength(100, { message: 'El responsable puede tener como máximo 100 caracteres' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  responsable?: string;

  @ApiPropertyOptional({ example: 'Directora de Compras', description: 'Cargo del responsable. Solo organismos públicos' })
  @IsString({ message: 'El cargo debe ser un texto' })
  @MaxLength(100, { message: 'El cargo puede tener como máximo 100 caracteres' })
  @IsOptional()
  cargoResponsable?: string;
}
