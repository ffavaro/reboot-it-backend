import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRackDto {
  @ApiProperty({ example: 'RACK-A01' })
  @IsString({ message: 'El código debe ser un texto' })
  codigo: string;

  @ApiProperty({ example: 'Depósito B - Fila 1' })
  @IsString({ message: 'La ubicación debe ser un texto' })
  ubicacion: string;
}
