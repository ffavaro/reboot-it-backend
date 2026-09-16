import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateDonacionDetalleDto {
  @ApiProperty()
  @IsInt()
  donacionId: number;

  @ApiProperty()
  @IsInt()
  tipoMaterialId: number;

  @ApiProperty()
  @IsInt()
  condicionMaterialId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadEstimada?: number;
}
