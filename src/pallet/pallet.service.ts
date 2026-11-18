import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Pallet } from './pallet.entity';
import { Lote } from '../lote/lote.entity';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';
import { buscarActivo } from '../utils/catalogo';

@Injectable()
export class PalletService extends CrudService<Pallet, CreatePalletDto, UpdatePalletDto> {
  constructor(@InjectRepository(Pallet) repo: Repository<Pallet>) {
    super(repo, { etiqueta: 'Pallet', genero: 'm', relations: ['rack', 'lote'], order: { id: 'DESC' } });
  }

  async create(dto: CreatePalletDto) {
    const saved = await super.create(dto);
    const m = this.repo.manager;
    const lote = dto.loteId ? await m.findOne(Lote, { where: { id: dto.loteId } }) : null;
    if (!lote) return saved;

    const [estadoTurno, estadoDonacion, turno] = await Promise.all([
      buscarActivo(m, EstadoTurno, { descripcion: 'Finalizado' }),
      buscarActivo(m, EstadoDonacion, { descripcion: 'Pendiente de emision certificado' }),
      m.findOne(Turno, { where: { donacionId: lote.donacionId, isActive: true }, order: { createdAt: 'DESC' } }),
    ]);

    await Promise.all([
      turno && estadoTurno && m.update(Turno, turno.id, { estadoTurnoId: estadoTurno.id }),
      estadoDonacion && m.update(Donacion, lote.donacionId, { estadoDonacionId: estadoDonacion.id }),
    ]);

    return saved;
  }
}
