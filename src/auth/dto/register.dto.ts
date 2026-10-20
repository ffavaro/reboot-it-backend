import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

const SOLO_LETRAS = /^[\p{L} ]+$/u;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class RegisterDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre (particular) o razón social (empresa / organismo)' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  // Las restricciones de nombre aplican solo a personas (cuando se envía apellido)
  @ValidateIf((o: RegisterDto) => o.apellido !== undefined)
  @MaxLength(25, { message: 'El nombre puede tener como máximo 25 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El nombre solo puede contener letras' })
  name: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(25, { message: 'El apellido puede tener como máximo 25 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El apellido solo puede contener letras' })
  apellido?: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'Correo inválido' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: '20123456789' })
  @IsString()
  @IsNotEmpty({ message: 'El CUIT/DNI es obligatorio' })
  cuitDni: string;
}
