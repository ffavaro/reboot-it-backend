import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @MaxLength(25, { message: 'El apellido no puede superar los 25 caracteres' })
  @IsOptional()
  apellido?: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150, { message: 'El correo no puede superar los 150 caracteres' })
  email: string;

  @ApiPropertyOptional({ example: 'password123', minLength: 6, description: 'Si no se provee, se usa "reboot2024_it" como contraseña por defecto' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  @MaxLength(12, { message: 'La contraseña no puede superar los 12 caracteres' })
  password?: string;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El rol debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  rolId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'El empleado debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  empleadoId?: number;

  @ApiPropertyOptional({ example: '20123456789' })
  @IsString({ message: 'El CUIT/DNI debe ser un texto' })
  @Matches(/^([0-9]{8}|[0-9]{11})$/, { message: 'El CUIT/DNI debe tener 8 (DNI) u 11 (CUIT) dígitos numéricos' })
  @IsOptional()
  cuitDni?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @ApiProperty({ example: true })
  isActive: boolean;
}
