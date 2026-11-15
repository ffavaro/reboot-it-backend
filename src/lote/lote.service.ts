import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Lote } from './lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LoteService extends CrudService<Lote, CreateLoteDto, UpdateLoteDto> {
  constructor(@InjectRepository(Lote) repo: Repository<Lote>) {
    super(repo, {
      etiqueta: 'Lote',
      genero: 'm',
      relations: ['donacion', 'donacion.donante'],
      relationsOne: ['donacion'],
      order: { id: 'DESC' },
    });
  }
}
