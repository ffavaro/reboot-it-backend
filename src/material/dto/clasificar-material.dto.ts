import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class ClasificarMaterialDto {
  @ApiProperty({ example: 1, description: 'ID de la condición del material' })
  @IsNumber({}, { message: 'La condición del material debe ser un número' })
  @Type(() => Number)
  condicionMaterialId: number;

  @ApiPropertyOptional({ example: true, description: 'Si es de tipo Almacenamiento, indica si requiere proceso de destrucción' })
  @IsBoolean({ message: 'El campo "requiere destrucción" debe ser verdadero o falso' })
  @IsOptional()
  requiereDestruccion?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'ID del tipo de medio de almacenamiento (requerido si requiereDestruccion=true)' })
  @ValidateIf((o) => o.requiereDestruccion === true)
  @IsNumber({}, { message: 'El tipo debe ser un número' })
  @Type(() => Number)
  tipoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la marca del medio de almacenamiento (requerido si requiereDestruccion=true)' })
  @ValidateIf((o) => o.requiereDestruccion === true)
  @IsNumber({}, { message: 'La marca debe ser un número' })
  @Type(() => Number)
  marcaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del modelo del medio de almacenamiento (requerido si requiereDestruccion=true)' })
  @ValidateIf((o) => o.requiereDestruccion === true)
  @IsNumber({}, { message: 'El modelo debe ser un número' })
  @Type(() => Number)
  modeloId?: number;

  @ApiPropertyOptional({ example: 'Disco duro con datos sensibles' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;
}
