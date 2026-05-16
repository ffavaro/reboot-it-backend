import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateModeloDto {
  @ApiProperty({ example: 'Barracuda 500GB' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 1, description: 'ID de la marca' })
  @IsNumber()
  marcaId: number;

  @ApiProperty({ example: 1, description: 'ID del tipo' })
  @IsNumber()
  tipoId: number;
}
