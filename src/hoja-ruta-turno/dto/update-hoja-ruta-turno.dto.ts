import { PartialType } from '@nestjs/swagger';
import { CreateHojaRutaTurnoDto } from './create-hoja-ruta-turno.dto';

export class UpdateHojaRutaTurnoDto extends PartialType(CreateHojaRutaTurnoDto) {}
