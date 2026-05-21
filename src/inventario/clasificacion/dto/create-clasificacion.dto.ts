import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateClasificacionDto {
  @ApiProperty({ example: 1, description: 'ID del lote' })
  @IsNumber()
  loteId: number;

  @ApiPropertyOptional({ example: '2024-06-15', description: 'Fecha de clasificación' })
  @IsDateString()
  @IsOptional()
  fecha?: Date;

  @ApiPropertyOptional({ example: 1, description: 'ID del empleado inspector' })
  @IsNumber()
  @IsOptional()
  empleadoId?: number;
}
