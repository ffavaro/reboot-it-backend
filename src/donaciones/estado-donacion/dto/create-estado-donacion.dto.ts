import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateEstadoDonacionDto {
  @ApiProperty({ example: 'Pendiente' })
  @IsString()
  @MaxLength(50)
  descripcion: string;
}
