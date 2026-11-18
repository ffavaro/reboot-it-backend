import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { CertificadoDisposicion } from './certificado-disposicion.entity';
import { Lote } from '../lote/lote.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { CreateCertificadoDisposicionDto } from './dto/create-certificado-disposicion.dto';
import { UpdateCertificadoDisposicionDto } from './dto/update-certificado-disposicion.dto';
import { buscarActivo } from '../utils/catalogo';

@Injectable()
export class CertificadoDisposicionService extends CrudService<CertificadoDisposicion, CreateCertificadoDisposicionDto, UpdateCertificadoDisposicionDto> {
  constructor(@InjectRepository(CertificadoDisposicion) repo: Repository<CertificadoDisposicion>) {
    super(repo, { etiqueta: 'CertificadoDisposicion', genero: 'm', relations: ['lote', 'gestorAmbiental'], order: { id: 'DESC' } });
  }

  async create(dto: CreateCertificadoDisposicionDto) {
    const fechaEmision = new Date();
    const numeroCertificado = await this.generarNumeroCertificado(fechaEmision);
    const saved = await this.repo.save(this.repo.create({ ...dto, fechaEmision, numeroCertificado }));

    const m = this.repo.manager;
    const lote = await m.findOne(Lote, { where: { id: dto.loteId } });
    if (lote) {
      const estadoFinalizada = await buscarActivo(m, EstadoDonacion, { descripcion: 'Finalizada' });
      if (estadoFinalizada) await m.update(Donacion, lote.donacionId, { estadoDonacionId: estadoFinalizada.id });
    }

    return saved;
  }

  private async generarNumeroCertificado(fecha: Date): Promise<string> {
    const prefijo = `CERT-${fecha.getFullYear()}-`;
    const cantidadEmitidos = await this.repo.count({ where: { numeroCertificado: Like(`${prefijo}%`) } });
    return `${prefijo}${String(cantidadEmitidos + 1).padStart(4, '0')}`;
  }
}
