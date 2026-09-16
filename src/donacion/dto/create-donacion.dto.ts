import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class DetalleInlineDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tipoMaterialId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  condicionMaterialId: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadEstimada?: number;
}

export class CreateDonacionDto {
  @ApiProperty({ example: 1, description: 'ID del donante' })
  @IsNumber()
  donanteId: number;

  @ApiProperty({ example: '2024-06-15T10:00:00Z', description: 'Fecha y hora del turno a crear' })
  @IsDateString()
  fechaHora: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de la donación' })
  @IsNumber()
  @IsOptional()
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: 'Equipos informáticos en desuso' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  necesitaRetiro?: boolean;

  @ApiPropertyOptional({
    example: 'Av. Siempre Viva 742',
    description: 'Dirección de retiro distinta a la registrada en el donante',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccionRetiro?: string;

  @ApiPropertyOptional({
    example: 25.5,
    description: 'Peso estimado (kg) de la donación, usado para asignar un transportista compatible',
  })
  @IsNumber()
  @IsOptional()
  pesoEstimadoKg?: number;

  @ApiPropertyOptional({ type: [DetalleInlineDto] })
  @IsOptional()
  @IsArray()
  detalles?: DetalleInlineDto[];
}
