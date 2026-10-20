import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEstadoTurnoDto {
  @ApiProperty({ example: 'Pendiente' })
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion: string;
}
