import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteDonacionDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del donante' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  donanteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de donación' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: true, description: 'true = retiro a domicilio, false = en sucursal' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean()
  necesitaRetiro?: boolean;

  @ApiPropertyOptional({ example: true, description: 'true = con materiales, false = sin materiales' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean()
  tieneMateriales?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de registro desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de registro hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
