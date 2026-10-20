import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ESTADOS_HOJA_RUTA } from '../hoja-ruta.entity';


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

export class GenerarHojaRutaDto {
  @ApiProperty({ example: 1, description: 'Empleado transportista para el que se genera la hoja de ruta' })
  @IsInt({ message: 'El empleado transportista es obligatorio' })
  @Min(1, { message: 'El empleado transportista es obligatorio' })
  empleadoTransportistaId: number;

  @ApiPropertyOptional({ example: '2026-10-21', description: 'Fecha de los turnos pendientes que incluye la hoja (yyyy-MM-dd). Por defecto, hoy' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser válida (yyyy-MM-dd)' })
  fecha?: string;

  @ApiPropertyOptional({ description: 'Genera la hoja aunque el transportista tenga otra hoja iniciada con turnos pendientes de retiro' })
  @IsOptional()
  @IsBoolean({ message: 'El campo "confirmar" debe ser verdadero o falso' })
  confirmar?: boolean;
}
