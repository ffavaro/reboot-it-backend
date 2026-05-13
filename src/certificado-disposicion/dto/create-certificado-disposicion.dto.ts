import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCertificadoDisposicionDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber()
  loteId: number;

  @ApiProperty({ example: 1, description: 'ID del gestor ambiental certificador' })
  @IsNumber()
  gestorCertificadoId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha de emisión' })
  @IsDateString()
  @IsOptional()
  fechaEmision?: Date;

  @ApiPropertyOptional({ example: 'CERT-2024-0001' })
  @IsString()
  @IsOptional()
  numeroCertificado?: string;

  @ApiPropertyOptional({ example: 'Material procesado conforme normativa vigente' })
  @IsString()
  @IsOptional()
  terminosCod?: string;
}
