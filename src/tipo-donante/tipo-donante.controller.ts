import { Controller} from '@nestjs/common';
import { TipoDonanteService } from './tipo-donante.service';
import { CreateTipoDonanteDto } from './dto/create-tipo-donante.dto';
import { UpdateTipoDonanteDto } from './dto/update-tipo-donante.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('tipo-donante')
export class TipoDonanteController extends createCrudController({
  path: 'tipo-donante',
  pantalla: 'donantes',
  sustantivo: 'tipo-donante',
  plural: 'tipo-donantes',
  createDto: CreateTipoDonanteDto,
  updateDto: UpdateTipoDonanteDto,
   lectura: ['tipo-donante', 'donantes', 'modelos'],
}) {
  constructor( tipoDonanteService: TipoDonanteService) {
    super(tipoDonanteService)
  }
}
