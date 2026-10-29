import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

const SOLO_LETRAS = /^[\p{L} ]+$/u;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class RegisterDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre (particular) o razón social (empresa / organismo)' })
  @Transform(trim)
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  // Las restricciones de nombre aplican solo a personas (cuando se envía apellido)
  @ValidateIf((o: RegisterDto) => o.apellido !== undefined)
  @MaxLength(25, { message: 'El nombre puede tener como máximo 25 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El nombre solo puede contener letras' })
  name: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @Transform(trim)
  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(25, { message: 'El apellido puede tener como máximo 25 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El apellido solo puede contener letras' })
  apellido?: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'Correo inválido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150, { message: 'El correo no puede superar los 150 caracteres' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(12, { message: 'La contraseña no puede superar los 12 caracteres' })
  password: string;

  @ApiProperty({ example: '20123456789' })
  @IsString({ message: 'El CUIT/DNI debe ser un texto' })
  @IsNotEmpty({ message: 'El CUIT/DNI es obligatorio' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^(\d{8}|\d{11})$/, { message: 'El CUIT/DNI debe tener 8 (DNI) u 11 (CUIT) dígitos numéricos' })
  cuitDni: string;
}
