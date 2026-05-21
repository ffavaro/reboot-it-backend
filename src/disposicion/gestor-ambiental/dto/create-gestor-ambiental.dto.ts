import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGestorAmbientalDto {
  @ApiProperty({ example: 'Reciclados S.A.' })
  @IsString()
  razonSocial: string;

  @ApiPropertyOptional({ example: '30-12345678-9' })
  @IsString()
  @IsOptional()
  cuit?: string;

  @ApiPropertyOptional({ example: 'HAB-2024-001' })
  @IsString()
  @IsOptional()
  habilitacion?: string;

  @ApiPropertyOptional({ example: 'info@reciclados.com' })
  @IsString()
  @IsOptional()
  contacto?: string;
}
