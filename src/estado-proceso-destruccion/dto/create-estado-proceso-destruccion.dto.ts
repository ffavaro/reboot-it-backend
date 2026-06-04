import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEstadoProcesoDestruccionDto {
  @ApiProperty({ example: 'Pendiente' })
  @IsString()
  @MaxLength(50)
  nombre: string;

  @ApiPropertyOptional({ example: 'En espera de ejecución o recursos' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}
