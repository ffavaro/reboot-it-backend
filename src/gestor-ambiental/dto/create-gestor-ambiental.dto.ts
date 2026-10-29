import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGestorAmbientalDto {
  @ApiProperty({ example: 'Reciclados S.A.' })
  @IsString({ message: 'La razón social debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @MaxLength(150, { message: 'La razón social no puede superar los 150 caracteres' })
  razonSocial: string;

  @ApiPropertyOptional({ example: '30-12345678-9' })
  @IsString({ message: 'El CUIT debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(20, { message: 'El CUIT no puede superar los 20 caracteres' })
  @Matches(/^\d{2}-?\d{8}-?\d$/, { message: 'El CUIT debe tener 11 dígitos (XX-XXXXXXXX-X)' })
  cuit?: string;

  @ApiProperty({ example: 'HAB-2024-001' })
  @IsString({ message: 'La habilitación debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La habilitación es obligatoria' })
  @MaxLength(100, { message: 'La habilitación no puede superar los 100 caracteres' })
  habilitacion: string;

  @ApiPropertyOptional({ example: 'info@reciclados.com' })
  @IsString({ message: 'El contacto debe ser un texto' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(100, { message: 'El contacto no puede superar los 100 caracteres' })
  contacto?: string;
}
