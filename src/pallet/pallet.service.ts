import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Pallet } from './pallet.entity';
import { Lote } from '../lote/lote.entity';
import { Turno } from '../turno/turno.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';
import { ESTADO_DONACION, ESTADO_TURNO } from '../common/constants/estados';

const ESTADO_TURNO_FINALIZADO = ESTADO_TURNO.FINALIZADO;
const ESTADO_DONACION_PENDIENTE_CERT = ESTADO_DONACION.PENDIENTE_CERTIFICADO;

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

  // Un lote se guarda en un único pallet (y por lo tanto en un único rack)
  private async validarLoteLibre(loteId: number, ignorarPalletId?: number) {
    const ocupado = await this.palletRepository.findOne({
      where: { loteId, isActive: true, ...(ignorarPalletId ? { id: Not(ignorarPalletId) } : {}) },
      relations: ['rack'],
    });
    if (ocupado) {
      const donde = ocupado.rack?.codigo ? ` del rack ${ocupado.rack.codigo}` : '';
      throw new ConflictException(`El lote #${loteId} ya está asignado al pallet #${ocupado.id}${donde}. Un lote solo puede estar en un rack.`);
    }
  }

  async create(dto: CreatePalletDto) {
    if (dto.loteId) await this.validarLoteLibre(dto.loteId);
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
    if (dto.loteId) await this.validarLoteLibre(dto.loteId, id);
    await this.palletRepository.update(id, dto);
    return this.findOne(id);
  }

  /** Regla L del Técnico: da de baja un pallet solo si está vacío (sin lote, o con un lote sin materiales activos). */
  async validarBajaDelTecnico(id: number) {
    const pallet = await this.findOne(id);
    if (!pallet.loteId) return;
    const materiales = await this.palletRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'n')
      .from('material', 'm')
      .where('m.lote_id = :loteId AND m.is_active = 1', { loteId: pallet.loteId })
      .getRawOne<{ n: string }>();
    if (Number(materiales?.n ?? 0) > 0) {
      throw new ConflictException('El pallet no está vacío: tiene un lote con materiales.');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.palletRepository.update(id, { isActive: false });
    return { message: 'Pallet desactivado' };
  }
}
