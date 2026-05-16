import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateMarcaDto {
  @ApiProperty({ example: 'Seagate' })
  @IsString()
  @MaxLength(50)
  nombre: string;
}
