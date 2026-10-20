import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCertificadoDisposicionDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  loteId: number;

  @ApiProperty({ example: 1, description: 'ID del gestor ambiental' })
  @IsNumber({}, { message: 'El gestor ambiental debe ser un número' })
  gestorAmbientalId: number;

  // fechaEmision y numeroCertificado no se reciben del cliente: el service
  // los genera automáticamente (fecha del día y numeración correlativa).

  @ApiPropertyOptional({ example: 'Material procesado conforme normativa vigente' })
  @IsString({ message: 'Los términos y condiciones deben ser un texto' })
  @IsOptional()
  terminosCondiciones?: string;
}
