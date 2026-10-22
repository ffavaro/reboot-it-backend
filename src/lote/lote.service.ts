import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LoteService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
  ) {}

  create(dto: CreateLoteDto) {
    const lote = this.loteRepository.create(dto);
    return this.loteRepository.save(lote);
  }

  // La grilla de lotes muestra el donante: se devuelve solo el nombre, sin datos de contacto
  private conDonante<T extends { donacion?: { donante?: unknown } }>(lotes: T[]): T[] {
    lotes.forEach((l) => {
      const d = l.donacion?.donante as { id: number; nombre: string; razonSocial?: string | null } | undefined;
      if (l.donacion && d) l.donacion.donante = { id: d.id, nombre: d.nombre, razonSocial: d.razonSocial ?? null };
    });
    return lotes;
  }

  async findAll() {
    const lotes = await this.loteRepository.find({
      where: { isActive: true },
      relations: ['donacion', 'donacion.donante'],
    });
    return this.conDonante(lotes);
  }

  async findOne(id: number) {
    const lote = await this.loteRepository.findOne({
      where: { id },
      relations: ['donacion', 'donacion.donante'],
    });
    if (!lote) throw new NotFoundException(`Lote ${id} no encontrado`);
    return this.conDonante([lote])[0];
  }

  async update(id: number, dto: UpdateLoteDto) {
    await this.findOne(id);
    await this.loteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.loteRepository.update(id, { isActive: false });
    return { message: 'Lote desactivado' };
  }
}
