import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pallet } from './pallet.entity';
import { Lote } from '../lote/lote.entity';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';

const ESTADO_TURNO_FINALIZADO = 'Finalizado';
const ESTADO_DONACION_PENDIENTE_CERT = 'Pendiente de emision certificado';

@Injectable()
export class PalletService {
  constructor(
    @InjectRepository(Pallet)
    private readonly palletRepository: Repository<Pallet>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(EstadoDonacion)
    private readonly estadoDonacionRepository: Repository<EstadoDonacion>,
    @InjectRepository(EstadoTurno)
    private readonly estadoTurnoRepository: Repository<EstadoTurno>,
  ) {}

  async create(dto: CreatePalletDto) {
    const pallet = this.palletRepository.create(dto);
    const saved = await this.palletRepository.save(pallet);

    if (dto.loteId) {
      const lote = await this.loteRepository.findOne({ where: { id: dto.loteId } });
      if (lote) {
        const [estadoTurno, estadoDonacion] = await Promise.all([
          this.estadoTurnoRepository.findOne({ where: { descripcion: ESTADO_TURNO_FINALIZADO, isActive: true } }),
          this.estadoDonacionRepository.findOne({ where: { descripcion: ESTADO_DONACION_PENDIENTE_CERT, isActive: true } }),
        ]);

        const turno = await this.turnoRepository.findOne({
          where: { donacionId: lote.donacionId, isActive: true },
          order: { createdAt: 'DESC' },
        });

        await Promise.all([
          turno && estadoTurno
            ? this.turnoRepository.update(turno.id, { estadoTurnoId: estadoTurno.id })
            : Promise.resolve(),
          estadoDonacion
            ? this.donacionRepository.update(lote.donacionId, { estadoDonacionId: estadoDonacion.id })
            : Promise.resolve(),
        ]);
      }
    }

    return saved;
  }

  findAll() {
    return this.palletRepository.find({
      where: { isActive: true },
      relations: ['rack', 'lote'],
    });
  }

  async findOne(id: number) {
    const pallet = await this.palletRepository.findOne({
      where: { id },
      relations: ['rack', 'lote'],
    });
    if (!pallet) throw new NotFoundException(`Pallet ${id} no encontrado`);
    return pallet;
  }

  async update(id: number, dto: UpdatePalletDto) {
    await this.findOne(id);
    await this.palletRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.palletRepository.update(id, { isActive: false });
    return { message: 'Pallet desactivado' };
  }
}
