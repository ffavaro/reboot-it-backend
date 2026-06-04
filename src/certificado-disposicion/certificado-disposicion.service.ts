import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificadoDisposicion } from './certificado-disposicion.entity';
import { Lote } from '../lote/lote.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { CreateCertificadoDisposicionDto } from './dto/create-certificado-disposicion.dto';
import { UpdateCertificadoDisposicionDto } from './dto/update-certificado-disposicion.dto';

const ESTADO_DONACION_FINALIZADA = 'Finalizada';

@Injectable()
export class CertificadoDisposicionService {
  constructor(
    @InjectRepository(CertificadoDisposicion)
    private readonly certificadoDisposicionRepository: Repository<CertificadoDisposicion>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(EstadoDonacion)
    private readonly estadoDonacionRepository: Repository<EstadoDonacion>,
  ) {}

  async create(dto: CreateCertificadoDisposicionDto) {
    const certificadoDisposicion = this.certificadoDisposicionRepository.create(dto);
    const saved = await this.certificadoDisposicionRepository.save(certificadoDisposicion);

    const lote = await this.loteRepository.findOne({ where: { id: dto.loteId } });
    if (lote) {
      const estadoFinalizada = await this.estadoDonacionRepository.findOne({
        where: { descripcion: ESTADO_DONACION_FINALIZADA, isActive: true },
      });
      if (estadoFinalizada) {
        await this.donacionRepository.update(lote.donacionId, { estadoDonacionId: estadoFinalizada.id });
      }
    }

    return saved;
  }

  findAll() {
    return this.certificadoDisposicionRepository.find({
      where: { isActive: true },
      relations: ['lote', 'gestorAmbiental'],
    });
  }

  async findOne(id: number) {
    const certificadoDisposicion = await this.certificadoDisposicionRepository.findOne({
      where: { id },
      relations: ['lote', 'gestorAmbiental'],
    });
    if (!certificadoDisposicion) throw new NotFoundException(`CertificadoDisposicion ${id} no encontrado`);
    return certificadoDisposicion;
  }

  async update(id: number, dto: UpdateCertificadoDisposicionDto) {
    await this.findOne(id);
    await this.certificadoDisposicionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.certificadoDisposicionRepository.update(id, { isActive: false });
    return { message: 'CertificadoDisposicion desactivado' };
  }
}
