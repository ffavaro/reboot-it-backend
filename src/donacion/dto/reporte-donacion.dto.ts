import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReporteDonacionDto {
  @ApiPropertyOptional({ example: 1, description: 'ID del donante' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El donante debe ser un número entero' })
  donanteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado de donación' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El estado de la donación debe ser un número entero' })
  estadoDonacionId?: number;

  @ApiPropertyOptional({ example: true, description: 'true = retiro a domicilio, false = en sucursal' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean({ message: 'El campo "necesita retiro" debe ser verdadero o falso' })
  necesitaRetiro?: boolean;

  @ApiPropertyOptional({ example: true, description: 'true = con materiales, false = sin materiales' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean({ message: 'El campo "tiene materiales" debe ser verdadero o falso' })
  tieneMateriales?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha de registro desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de registro hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  fechaHasta?: string;
}
