import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTurnoDetalleDto {
  @ApiProperty()
  @IsInt()
  turnoId: number;

  @ApiProperty()
  @IsInt()
  donacionDetalleId: number;

  @ApiProperty()
  @IsInt()
  tipoMaterialId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  cantidadConfirmada?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
