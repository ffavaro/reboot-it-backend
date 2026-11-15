import { Controller} from '@nestjs/common';
import { RackService } from './rack.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('rack')
export class RackController extends createCrudController({
  path: 'rack',
  pantalla: 'racks',
  sustantivo: 'rack',
  plural: 'racks',
  createDto: CreateRackDto,
  updateDto: UpdateRackDto,
   lectura: ['rack'],
}) {
  constructor( rackService: RackService) {
    super(rackService)
  }
}
