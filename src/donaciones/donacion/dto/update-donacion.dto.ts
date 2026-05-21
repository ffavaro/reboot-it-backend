import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ type: [DetalleInlineDto] })
  @IsOptional()
  @IsArray()
  detalles?: DetalleInlineDto[];
}
