import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class DashboardQueryDto {

    @ApiProperty({
        description: 'Fecha desde la cual se desea obtener los datos del dashboard. Formato: YYYY-MM-DD',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
    fechaDesde?: string;

    @ApiProperty({
        description: 'Fecha hasta la cual se desea obtener los datos del dashboard. Formato: YYYY-MM-DD',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
    fechaHasta?: string;

    @ApiProperty({
        description: 'Identificador del donante para filtrar los datos del dashboard.',
        required: false,
        example: '1,2,3',
    })
    @IsOptional()
    @IsString()
    donanteIds?: string;
}
