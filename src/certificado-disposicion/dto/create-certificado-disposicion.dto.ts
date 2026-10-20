import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCertificadoDisposicionDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber({}, { message: 'El lote debe ser un número' })
  loteId: number;

  @ApiProperty({ example: 1, description: 'ID del gestor ambiental' })
  @IsNumber({}, { message: 'El gestor ambiental debe ser un número' })
  gestorAmbientalId: number;

  @ApiProperty({ example: 'http://localhost:3001/uploads/123-456.pdf', description: 'URL de la foto o PDF del certificado de disposición final (se sube antes con POST /upload)' })
  @IsString({ message: 'El archivo del certificado debe ser un texto (URL)' })
  @IsNotEmpty({ message: 'El archivo del certificado de disposición final es obligatorio' })
  @MaxLength(500, { message: 'La URL del archivo no puede superar los 500 caracteres' })
  archivoFinalUrl: string;

  // fechaEmision y numeroCertificado no se reciben del cliente: el service
  // los genera automáticamente (fecha del día y numeración correlativa).

  @ApiPropertyOptional({ example: 'Material procesado conforme normativa vigente' })
  @IsString({ message: 'Los términos y condiciones deben ser un texto' })
  @IsOptional()
  terminosCondiciones?: string;
}
