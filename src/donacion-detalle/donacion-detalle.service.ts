import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonacionDetalle } from './donacion-detalle.entity';
import { CreateDonacionDetalleDto } from './dto/create-donacion-detalle.dto';
import { UpdateDonacionDetalleDto } from './dto/update-donacion-detalle.dto';
import { CrudService } from '@app/common/crud/crud-service';

const RELATIONS = ['tipoMaterial', 'condicionMaterial'];

@Injectable()
export class DonacionDetalleService extends CrudService<
  DonacionDetalle, CreateDonacionDetalleDto, UpdateDonacionDetalleDto
> {
  constructor(@InjectRepository(DonacionDetalle) repo: Repository<DonacionDetalle>) {
    super(repo, { etiqueta: 'DonacionDetalle', genero:'m', relations: RELATIONS });
  }

  findByDonacion(donacionId: number) {
    return this.repo.find({ where: { donacionId, isActive: true }, relations: RELATIONS });
  }
}

