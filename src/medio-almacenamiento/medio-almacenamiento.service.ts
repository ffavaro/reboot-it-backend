import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { MedioAlmacenamiento } from './medio-almacenamiento.entity';
import { CreateMedioAlmacenamientoDto } from './dto/create-medio-almacenamiento.dto';
import { UpdateMedioAlmacenamientoDto } from './dto/update-medio-almacenamiento.dto';

@Injectable()
export class MedioAlmacenamientoService extends CrudService<
  MedioAlmacenamiento,
  CreateMedioAlmacenamientoDto,
  UpdateMedioAlmacenamientoDto
> {
  constructor(@InjectRepository(MedioAlmacenamiento) repo: Repository<MedioAlmacenamiento>) {
    super(repo, {
      etiqueta: 'MedioAlmacenamiento', genero: 'm',
      relations: ['material', 'tipo', 'marca', 'modelo'],
      order: { id: 'DESC' },
    });
  }
}
