import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateProcesoDestruccionDto {
  @ApiProperty({ example: 1, description: 'ID del medio de almacenamiento' })
  @IsNumber()
  medioAlmacenamientoId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del proceso' })
  @IsDateString()
  @IsOptional()
  fecha?: Date;

  @ApiPropertyOptional({ example: 1, description: 'ID del método de destrucción' })
  @IsNumber()
  @IsOptional()
  metodoDestruccionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del estado del proceso (default: 1 = Iniciado)' })
  @IsNumber()
  @IsOptional()
  estadoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado responsable' })
  @IsNumber()
  @IsOptional()
  empleadoId?: number;
}
