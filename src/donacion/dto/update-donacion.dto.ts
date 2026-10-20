import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { DetalleInlineDto } from './create-donacion.dto';

export class UpdateDonacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'El donante debe ser un número' })
  donanteId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'El estado de la donación debe ser un número' })
  estadoDonacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean({ message: 'El campo "necesita retiro" debe ser verdadero o falso' })
  @IsOptional()
  necesitaRetiro?: boolean;

  @ApiPropertyOptional({
    example: 'Av. Siempre Viva 742',
    description: 'Dirección de retiro distinta a la registrada en el donante',
  })
  @IsString({ message: 'La dirección de retiro debe ser un texto' })
  @IsOptional()
  direccionRetiro?: string | null;

  @ApiPropertyOptional({
    example: 25.5,
    description: 'Peso estimado (kg) de la donación, usado para asignar un transportista compatible',
  })
  @IsNumber({}, { message: 'El peso estimado debe ser un número' })
  @IsOptional()
  pesoEstimadoKg?: number | null;

  @ApiPropertyOptional({ type: [DetalleInlineDto] })
  @IsOptional()
  @IsArray({ message: 'Los detalles deben ser una lista' })
  detalles?: DetalleInlineDto[];
}
