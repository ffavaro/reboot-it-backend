import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGestorAmbientalDto {
  @ApiProperty({ example: 'Reciclados S.A.' })
  @IsString({ message: 'La razón social debe ser un texto' })
  razonSocial: string;

  @ApiPropertyOptional({ example: '30-12345678-9' })
  @IsString({ message: 'El CUIT debe ser un texto' })
  @IsOptional()
  cuit?: string;

  @ApiProperty({ example: 'HAB-2024-001' })
  @IsString({ message: 'La habilitación debe ser un texto' })
  habilitacion: string;

  @ApiPropertyOptional({ example: 'info@reciclados.com' })
  @IsString({ message: 'El contacto debe ser un texto' })
  @IsOptional()
  contacto?: string;
}
