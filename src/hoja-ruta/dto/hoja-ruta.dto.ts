import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ESTADOS_HOJA_RUTA } from '../hoja-ruta.entity';

const KM_MAX = 9999999;

export class DiaHojaRutaQueryDto {
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Inicio del rango (yyyy-MM-dd). Por defecto, hoy' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaDesde debe ser una fecha válida (yyyy-MM-dd)' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Fin del rango (yyyy-MM-dd). Máximo 31 días desde fechaDesde' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaHasta debe ser una fecha válida (yyyy-MM-dd)' })
  fechaHasta?: string;

  @ApiPropertyOptional({ example: '2026-10-19', description: 'Atajo para consultar un solo día (equivale a fechaDesde = fechaHasta)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser válida (yyyy-MM-dd)' })
  fecha?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por empleado transportista' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El empleado transportista debe ser un número entero' })
  @Min(1, { message: 'El empleado transportista debe ser como mínimo 1' })
  empleadoTransportistaId?: number;

  @ApiPropertyOptional({ enum: ESTADOS_HOJA_RUTA, description: 'Filtrar por estado' })
  @IsOptional()
  @IsIn(ESTADOS_HOJA_RUTA, { message: `El estado debe ser uno de: ${ESTADOS_HOJA_RUTA.join(', ')}` })
  estado?: string;
}

export class HistoricoHojaRutaQueryDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaDesde debe ser una fecha válida (yyyy-MM-dd)' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaHasta debe ser una fecha válida (yyyy-MM-dd)' })
  fechaHasta?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El empleado transportista debe ser un número entero' })
  @Min(1, { message: 'El empleado transportista debe ser como mínimo 1' })
  empleadoTransportistaId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El vehículo debe ser un número entero' })
  @Min(1, { message: 'El vehículo debe ser como mínimo 1' })
  vehiculoId?: number;
}

export class IniciarHojaRutaDto {
  @ApiProperty({ example: 1, description: 'Empleado transportista que inicia su hoja de ruta de hoy' })
  @IsInt({ message: 'El empleado transportista es obligatorio' })
  @Min(1, { message: 'El empleado transportista es obligatorio' })
  empleadoTransportistaId: number;
}

export class FinalizarHojaRutaDto {
  @ApiProperty({ example: 85120, description: 'Kilometraje final del vehículo (mayor o igual al inicial)' })
  @IsInt({ message: 'El kilometraje final debe ser un número entero' })
  @Min(0, { message: 'El kilometraje final no puede ser negativo' })
  @Max(KM_MAX, { message: `El kilometraje final no puede superar los ${KM_MAX} km` })
  kmFinal: number;
}
