import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCertificadoDisposicionDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber()
  loteId: number;

  @ApiProperty({ example: 1, description: 'ID del gestor ambiental' })
  @IsNumber()
  gestorAmbientalId: number;

  @ApiPropertyOptional({ example: 'Material procesado conforme normativa vigente' })
  @IsString()
  @IsOptional()
  terminosCondiciones?: string;

  @MaxLength(500)
  archivoFinalUrl?: string;
}
