import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';

// Datos del usuario que se crea junto con el donante (rol Donante, con el nombre del donante)
export class DatosUsuarioDonanteDto {
  @ApiProperty({ example: 'juan@email.com', description: 'Email con el que el donante inicia sesión' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'clave123', minLength: 6, description: 'Contraseña inicial del usuario' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  password: string;

  @ApiProperty({ example: '30123456', description: 'DNI (8 dígitos) o CUIT (11 dígitos), solo números' })
  @Matches(/^(\d{8}|\d{11})$/, { message: 'El CUIT/DNI debe tener 8 (DNI) u 11 (CUIT) dígitos numéricos' })
  cuitDni: string;
}

export class CreateDonanteDto {
  @ApiPropertyOptional({ example: 1, description: 'ID de un usuario ya existente (lo usa el registro público, que crea el usuario primero)' })
  @IsNumber({}, { message: 'El usuario debe ser un número' })
  @IsOptional()
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
