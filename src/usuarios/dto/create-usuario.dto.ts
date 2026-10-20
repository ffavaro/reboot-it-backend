import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @MaxLength(25, { message: 'El apellido no puede superar los 25 caracteres' })
  @IsOptional()
  apellido?: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiPropertyOptional({ example: 'password123', minLength: 6, description: 'Si no se provee, se usa "reboot2024_it" como contraseña por defecto' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'El rol debe ser un número' })
  rolId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'El empleado debe ser un número' })
  @IsOptional()
  empleadoId?: number;

  @ApiPropertyOptional({ example: '20123456789' })
  @IsString({ message: 'El CUIT/DNI debe ser un texto' })
  @IsOptional()
  cuitDni?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @ApiProperty({ example: true })
  isActive: boolean;
}
