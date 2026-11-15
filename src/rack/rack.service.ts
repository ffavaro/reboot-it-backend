import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rack } from './rack.entity';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class RackService extends CrudService<Rack, CreateRackDto, UpdateRackDto> {
  constructor(
    @InjectRepository(Rack) repo: Repository<Rack>,
  ) {
    super(repo, { etiqueta: 'Rack', genero: 'f' })
  }
}
