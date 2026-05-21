import { PartialType } from '@nestjs/swagger';
import { CreateRegistroFotograficoDto } from './create-registro-fotografico.dto';

export class UpdateRegistroFotograficoDto extends PartialType(CreateRegistroFotograficoDto) {}
