import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { DetalleInlineDto } from './create-donacion.dto';

export class UpdateDonacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  donanteId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estadoDonacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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
  direccionRetiro?: string | null;

  @ApiPropertyOptional({ type: [DetalleInlineDto] })
  @IsOptional()
  @IsArray()
  detalles?: DetalleInlineDto[];
}
