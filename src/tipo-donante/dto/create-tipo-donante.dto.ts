import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTipoDonanteDto {
  @ApiProperty({ example: 'Persona física' })
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion: string;
}
