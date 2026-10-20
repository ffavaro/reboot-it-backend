import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroFotografico } from './registro-fotografico.entity';
import { Turno } from '../turno/turno.entity';
import { Lote } from '../lote/lote.entity';
import { CreateRegistroFotograficoDto } from './dto/create-registro-fotografico.dto';
import { UpdateRegistroFotograficoDto } from './dto/update-registro-fotografico.dto';

@Injectable()
export class RegistroFotograficoService {
  constructor(
    @InjectRepository(RegistroFotografico)
    private readonly registroFotograficoRepository: Repository<RegistroFotografico>,
  ) {}

  async create(dto: CreateRegistroFotograficoDto) {
    if (dto.loteId === undefined && dto.turnoId === undefined) {
      throw new BadRequestException('Indicá el lote o el turno al que pertenece la foto.');
    }
    // Solo con el turno: la foto queda asociada también al lote de la donación de ese turno
    if (dto.loteId === undefined && dto.turnoId !== undefined) {
      const manager = this.registroFotograficoRepository.manager;
      const turno = await manager.getRepository(Turno).findOne({ where: { id: dto.turnoId } });
      if (!turno) throw new NotFoundException(`Turno ${dto.turnoId} no encontrado`);
      const lote = turno.donacionId
        ? await manager.getRepository(Lote).findOne({ where: { donacionId: turno.donacionId, isActive: true } })
        : null;
      if (lote) dto = { ...dto, loteId: lote.id };
    }
    const registroFotografico = this.registroFotograficoRepository.create(dto);
    return this.registroFotograficoRepository.save(registroFotografico);
  }

  findAll() {
    return this.registroFotograficoRepository.find({
      where: { isActive: true },
      relations: ['lote', 'turno'],
    });
  }

  findByTurno(turnoId: number) {
    return this.registroFotograficoRepository.find({
      where: { turnoId, isActive: true },
      relations: ['turno'],
    });
  }

  async findOne(id: number) {
    const registroFotografico = await this.registroFotograficoRepository.findOne({
      where: { id },
      relations: ['lote', 'turno'],
    });
    if (!registroFotografico) throw new NotFoundException(`RegistroFotografico ${id} no encontrado`);
    return registroFotografico;
  }

  async update(id: number, dto: UpdateRegistroFotograficoDto) {
    await this.findOne(id);
    await this.registroFotograficoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.registroFotograficoRepository.update(id, { isActive: false });
    return { message: 'RegistroFotografico desactivado' };
  }
}
