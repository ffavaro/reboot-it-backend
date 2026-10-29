import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateModeloDto {
  @ApiProperty({ example: 'Barracuda 500GB' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ example: 1, description: 'ID de la marca' })
  @IsNumber({}, { message: 'La marca debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  marcaId: number;

  @ApiProperty({ example: 1, description: 'ID del tipo' })
  @IsNumber({}, { message: 'El tipo debe ser un número' })
  @Min(1, { message: 'Seleccioná una opción válida' })
  tipoId: number;
}
