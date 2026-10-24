import { IsOptional, IsString, Matches } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha desde debe tener el formato aaaa-mm-dd' })
  fechaDesde?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha hasta debe tener el formato aaaa-mm-dd' })
  fechaHasta?: string;

  // ids de donantes separados por coma (vacío = todos)
  @IsOptional()
  @IsString({ message: 'Los donantes deben enviarse como ids separados por coma' })
  @Matches(/^(\d+(,\d+)*)?$/, { message: 'Los donantes deben ser ids numéricos separados por coma' })
  donanteIds?: string;
}
