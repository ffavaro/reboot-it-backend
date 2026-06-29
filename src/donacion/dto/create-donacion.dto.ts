import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class DetalleInlineDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tipoMaterialId: number;

  @ApiPropertyOptional({ example: 'Laptops en buen estado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadEstimada?: number;

  @ApiPropertyOptional({ example: 'Sin cargador' })
  @IsOptional()
  @IsString()
  observaciones?: string;
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

  @ApiPropertyOptional({ type: [DetalleInlineDto] })
  @IsOptional()
  @IsArray()
  detalles?: DetalleInlineDto[];
}
