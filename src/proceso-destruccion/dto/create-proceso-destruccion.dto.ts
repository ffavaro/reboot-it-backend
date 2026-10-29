import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProcesoDestruccionDto {
  @ApiProperty({ example: 1, description: 'ID del medio de almacenamiento' })
  @IsNumber({}, { message: 'El medio de almacenamiento debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  medioAlmacenamientoId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del proceso' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  @IsOptional()
  fecha?: Date;

  @ApiProperty({ example: 1, description: 'ID del método de destrucción' })
  @IsNumber({}, { message: 'El método de destrucción debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  metodoDestruccionId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado del proceso (default: 1 = Iniciado)' })
  @IsNumber({}, { message: 'El estado debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'Seleccioná una opción válida' })
  estadoId?: number;

  @ApiProperty({ example: 1, description: 'ID del empleado responsable' })
  @IsNumber({}, { message: 'El empleado debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  empleadoId: number;
}
