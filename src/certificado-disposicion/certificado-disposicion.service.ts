import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CertificadoDisposicion } from './certificado-disposicion.entity';
import { Material } from '../material/material.entity';
import { Lote } from '../lote/lote.entity';
import { Donacion } from '../donacion/donacion.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { CreateCertificadoDisposicionDto } from './dto/create-certificado-disposicion.dto';
import { UpdateCertificadoDisposicionDto } from './dto/update-certificado-disposicion.dto';
import { ESTADO_DONACION } from '../common/constants/estados';

const ESTADO_DONACION_FINALIZADA = ESTADO_DONACION.FINALIZADA;

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
    const fechaEmision = new Date();
    const numeroCertificado = await this.generarNumeroCertificado(fechaEmision);

    const certificadoDisposicion = this.certificadoDisposicionRepository.create({
      ...dto,
      fechaEmision,
      numeroCertificado,
    });
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

  /** Datos del certificado armados para generar su PDF: donante, lote, gestor ambiental y materiales por tipo y condición. */
  async datosParaPdf(id: number) {
    const certificado = await this.findOne(id);
    const manager = this.certificadoDisposicionRepository.manager;
    const lote = certificado.lote;
    const donacion = lote
      ? await this.donacionRepository.findOne({ where: { id: lote.donacionId }, relations: ['donante'] })
      : null;
    const materiales = await manager.getRepository(Material).find({
      where: { loteId: certificado.loteId, isActive: true },
      relations: ['tipoMaterial', 'condicionMaterial'],
    });
    // se agrupan por tipo y condición: "Notebook · Reciclable: 3"
    const grupos = new Map<string, { tipo: string; condicion: string; cantidad: number }>();
    for (const m of materiales) {
      const tipo = m.tipoMaterial?.nombre ?? `Material #${m.tipoMaterialId}`;
      const condicion = m.condicionMaterial?.condicion ?? 'Sin clasificar';
      const clave = `${tipo}|${condicion}`;
      const g = grupos.get(clave) ?? { tipo, condicion, cantidad: 0 };
      g.cantidad += 1;
      grupos.set(clave, g);
    }
    const donante = donacion?.donante;
    const gestor = certificado.gestorAmbiental;
    return {
      certificadoId: certificado.id,
      numeroCertificado: certificado.numeroCertificado,
      fechaEmision: certificado.fechaEmision,
      terminosCondiciones: certificado.terminosCondiciones ?? null,
      loteId: certificado.loteId,
      pesoBrutoKg: lote?.pesoBrutoKg ?? null,
      donacionId: lote?.donacionId ?? null,
      donante: {
        nombre: donante?.nombre ?? '',
        razonSocial: donante?.razonSocial ?? null,
        telefono: donante?.telefono ?? null,
        direccion: donante?.direccion ?? null,
      },
      gestor: gestor
        ? { razonSocial: gestor.razonSocial, cuit: gestor.cuit ?? null, habilitacion: gestor.habilitacion ?? null, contacto: gestor.contacto ?? null }
        : null,
      materiales: [...grupos.values()],
    };
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

  /**
   * Genera el número correlativo del certificado con el formato CERT-{año}-{secuencia}.
   * La secuencia reinicia cada año y se calcula contando todos los certificados
   * (activos e inactivos) ya emitidos ese año, para no repetir números ante bajas lógicas.
   */
  private async generarNumeroCertificado(fecha: Date): Promise<string> {
    const anio = fecha.getFullYear();
    const prefijo = `CERT-${anio}-`;
    const cantidadEmitidos = await this.certificadoDisposicionRepository.count({
      where: { numeroCertificado: Like(`${prefijo}%`) },
    });
    return `${prefijo}${String(cantidadEmitidos + 1).padStart(4, '0')}`;
  }
}
