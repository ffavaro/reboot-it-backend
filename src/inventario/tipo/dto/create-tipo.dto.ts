import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateTipoDto {
  @ApiProperty({ example: 'HDD' })
  @IsString()
  @MaxLength(50)
  nombre: string;
}
