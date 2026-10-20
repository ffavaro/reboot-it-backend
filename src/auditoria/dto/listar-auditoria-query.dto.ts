import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListarAuditoriaQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por usuario' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El usuario debe ser un número entero' })
  @Min(1, { message: 'El usuario debe ser como mínimo 1' })
  usuarioId?: number;

  @ApiPropertyOptional({ example: '2026-10-01', description: 'Desde (yyyy-MM-dd)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida (yyyy-MM-dd)' })
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Hasta (yyyy-MM-dd), inclusive' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida (yyyy-MM-dd)' })
  fechaHasta?: string;

  @ApiPropertyOptional({ example: 'turno', description: 'Texto contenido en la acción (ej. "Finalizó turno")' })
  @IsOptional()
  @IsString({ message: 'La acción debe ser un texto' })
  @MaxLength(100, { message: 'La acción no puede superar los 100 caracteres' })
  accion?: string;

  @ApiPropertyOptional({ enum: ['Éxito', 'Error'] })
  @IsOptional()
  @IsIn(['Éxito', 'Error'], { message: 'El resultado debe ser Éxito o Error' })
  resultado?: string;

  @ApiPropertyOptional({ example: 'turno', description: 'Entidad afectada' })
  @IsOptional()
  @IsString({ message: 'La entidad debe ser un texto' })
  @MaxLength(100, { message: 'La entidad no puede superar los 100 caracteres' })
  entidad?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser como mínimo 1' })
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Registros por página (máximo 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser como mínimo 1' })
  @Max(100, { message: 'El límite debe ser como máximo 100' })
  limit?: number;
}
