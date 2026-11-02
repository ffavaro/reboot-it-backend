import { PartialType } from '@nestjs/swagger';
import { CreateHojaRutaDto } from './create-hoja-ruta.dto';

export class UpdateHojaRutaDto extends PartialType(CreateHojaRutaDto) {}
