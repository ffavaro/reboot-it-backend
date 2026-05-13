import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificadoDisposicion } from './certificado-disposicion.entity';
import { CreateCertificadoDisposicionDto } from './dto/create-certificado-disposicion.dto';
import { UpdateCertificadoDisposicionDto } from './dto/update-certificado-disposicion.dto';

@Injectable()
export class CertificadoDisposicionService {
  constructor(
    @InjectRepository(CertificadoDisposicion)
    private readonly certificadoDisposicionRepository: Repository<CertificadoDisposicion>,
  ) {}

  create(dto: CreateCertificadoDisposicionDto) {
    const certificadoDisposicion = this.certificadoDisposicionRepository.create(dto);
    return this.certificadoDisposicionRepository.save(certificadoDisposicion);
  }

  findAll() {
    return this.certificadoDisposicionRepository.find({
      where: { isActive: true },
      relations: ['lote', 'gestorCertificado'],
    });
  }

  async findOne(id: number) {
    const certificadoDisposicion = await this.certificadoDisposicionRepository.findOne({
      where: { id },
      relations: ['lote', 'gestorCertificado'],
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
