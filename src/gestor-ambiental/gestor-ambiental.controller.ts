import { Controller} from '@nestjs/common';
import { GestorAmbientalService } from './gestor-ambiental.service';
import { CreateGestorAmbientalDto } from './dto/create-gestor-ambiental.dto';
import { UpdateGestorAmbientalDto } from './dto/update-gestor-ambiental.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('gestor-ambiental')
export class GestorAmbientalController extends createCrudController({
  path: 'gestor-ambiental',
  pantalla: 'gestora_ambiental',
  sustantivo: 'gestor-ambiental',
  plural: 'gestores-ambiental',
  createDto: CreateGestorAmbientalDto,
  updateDto: UpdateGestorAmbientalDto,
  lectura: ['gestora_ambiental', 'certificado_disposicion', 'donaciones'],
}) {
  constructor( gestorAmbientalService: GestorAmbientalService) {
    super(gestorAmbientalService)
  }
}
