import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProcesoDestruccionDto {
  @ApiProperty({ example: 1, description: 'ID del medio de almacenamiento' })
  @IsNumber()
  medioAlmacenamientoId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha del proceso' })
  @IsDateString()
  @IsOptional()
  fecha?: Date;

  @ApiPropertyOptional({ example: 'Trituración mecánica' })
  @IsString()
  @IsOptional()
  metodo?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado responsable' })
  @IsNumber()
  @IsOptional()
  empleadoId?: number;
}
