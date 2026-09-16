import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRackDto {
  @ApiProperty({ example: 'RACK-A01' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Depósito B - Fila 1' })
  @IsString()
  ubicacion: string;
}
