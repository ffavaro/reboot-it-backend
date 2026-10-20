import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateModeloDto {
  @ApiProperty({ example: 'Barracuda 500GB' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @ApiProperty({ example: 1, description: 'ID de la marca' })
  @IsNumber({}, { message: 'La marca debe ser un número' })
  marcaId: number;

  @ApiProperty({ example: 1, description: 'ID del tipo' })
  @IsNumber({}, { message: 'El tipo debe ser un número' })
  tipoId: number;
}
