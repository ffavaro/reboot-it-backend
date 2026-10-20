import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength, IsBoolean } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateEmpleadoDto {
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
  @Transform(trim)
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^\d{6,20}$/, { message: 'El teléfono debe tener entre 6 y 20 dígitos numéricos' })
  telefono: string;

  @ApiPropertyOptional({ example: 'Técnico IT' })
  @IsString({ message: 'El cargo debe ser un texto' })
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({ example: true, description: 'Tiene carnet de conducir (necesario para ser transportista)' })
  @IsBoolean({ message: 'El campo "tiene carnet" debe ser verdadero o falso' })
  @IsOptional()
  tieneCarnet?: boolean;

  @ApiPropertyOptional({ description: 'URL de la foto tipo carnet del empleado' })
  @Transform(trim)
  @IsString({ message: 'La foto debe ser un texto (URL)' })
  @MaxLength(255, { message: 'La URL de la foto no puede superar los 255 caracteres' })
  @IsOptional()
  fotoUrl?: string;

  // Datos del usuario que se crea junto con el empleado (con su mismo nombre, apellido, CUIT/DNI y rol)
  @ApiProperty({ example: 'juan.perez@empresa.com', description: 'Email con el que el empleado inicia sesión' })
  @Transform(trim)
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'clave123', minLength: 6, description: 'Contraseña inicial del usuario' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  password: string;
}
