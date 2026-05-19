import { PartialType } from '@nestjs/swagger';
import { CreateDonacionDetalleDto } from './create-donacion-detalle.dto';

export class UpdateDonacionDetalleDto extends PartialType(CreateDonacionDetalleDto) {}
