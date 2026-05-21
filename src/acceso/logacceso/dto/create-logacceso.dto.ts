import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLogAccesoDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  usuarioId: number;

  @ApiProperty({ example: 'LOGIN' })
  @IsString()
  accion: string;

  @ApiProperty({ example: 'EXITOSO' })
  @IsString()
  resultado: string;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  @IsString()
  @IsOptional()
  ip?: string;
}
