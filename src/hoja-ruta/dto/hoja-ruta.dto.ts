import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { ESTADOS_HOJA } from '../../utils/helpers';

const FECHA_INVALIDA = 'debe ser una fecha válida (yyyy-MM-dd)';

export class ConsultaHojaRutaDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString({}, { message: `fechaDesde ${FECHA_INVALIDA}` })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString({}, { message: `fechaHasta ${FECHA_INVALIDA}` })
  fechaHasta?: string;

  @ApiPropertyOptional({ example: '2026-10-19' })
  @IsOptional()
  @IsDateString({}, { message: `fecha ${FECHA_INVALIDA}` })
  fecha?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El transportista debe ser un número entero' })
  @Min(1, { message: 'El transportista debe ser como mínimo 1' })
  empleadoTransportistaId?: number;

  @ApiPropertyOptional({ enum: ESTADOS_HOJA })
  @IsOptional()
  @IsIn(ESTADOS_HOJA, {
    message: `El estado debe ser uno de: ${ESTADOS_HOJA.join(', ')}`,
  })
  estado?: string;
}

export class HistoricoHojaRutaDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString({}, { message: `fechaDesde ${FECHA_INVALIDA}` })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString({}, { message: `fechaHasta ${FECHA_INVALIDA}` })
  fechaHasta?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El transportista debe ser un número entero' })
  @Min(1, { message: 'El transportista debe ser como mínimo 1' })
  empleadoTransportistaId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El vehículo debe ser un número entero' })
  @Min(1, { message: 'El vehículo debe ser como mínimo 1' })
  vehiculoId?: number;
}

export class GenerarHojaRutaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'El transportista es obligatorio' })
  @Min(1, { message: 'El transportista es obligatorio' })
  empleadoTransportistaId: number;

  @ApiPropertyOptional({ example: '2026-10-21' })
  @IsOptional()
  @IsDateString({}, { message: `fecha ${FECHA_INVALIDA}` })
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'confirmar debe ser verdadero o falso' })
  confirmar?: boolean;
}
