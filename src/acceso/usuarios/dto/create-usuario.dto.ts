import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'password123', minLength: 6, description: 'Si no se provee, se usa "reboot2024_it" como contraseña por defecto' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  rolId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  empleadoId?: number;

  @ApiPropertyOptional({ example: '20123456789' })
  @IsString()
  @IsOptional()
  cuitDni?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: true })
  isActive: boolean;
}
