import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Material } from './material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ClasificarMaterialDto } from './dto/clasificar-material.dto';
import { ReporteMaterialDto } from './dto/reporte-material.dto';
import { MedioAlmacenamiento } from '../medio-almacenamiento/medio-almacenamiento.entity';
import { ProcesoDestruccion } from '../proceso-destruccion/proceso-destruccion.entity';

@Injectable()
export class MaterialService extends CrudService<Material, CreateMaterialDto, UpdateMaterialDto> {
  constructor(@InjectRepository(Material) repo: Repository<Material>) {
    super(repo, { etiqueta: 'Material', genero: 'm', relations: ['lote', 'tipoMaterial', 'condicionMaterial'], order: { id: 'DESC' } });
  }

  async clasificarMaterial(id: number, dto: ClasificarMaterialDto) {
    await this.findOne(id);

    const { requiereDestruccion, tipoId, marcaId, modeloId, ...updateData } = dto;
    await this.repo.update(id, updateData);

    if (requiereDestruccion) {
      const m = this.repo.manager;
      const medioData = m.create(MedioAlmacenamiento);
      medioData.materialId = id;
      if (tipoId) medioData.tipoId = tipoId;
      if (marcaId) medioData.marcaId = marcaId;
      if (modeloId) medioData.modeloId = modeloId;
      const medio = await m.save(medioData);

      const procesoData = m.create(ProcesoDestruccion);
      procesoData.medioAlmacenamientoId = medio.id;
      procesoData.fecha = new Date();
      procesoData.estadoId = 1;
      await m.save(procesoData);
    }
    return this.findOne(id);
  }

  async reporte(query: ReporteMaterialDto) {
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.lote', 'lote')
      .leftJoinAndSelect('m.tipoMaterial', 'tipoMaterial')
      .leftJoinAndSelect('m.condicionMaterial', 'condicionMaterial')
      .where('m.isActive = :active', { active: true });

    if (query.tipoMaterialId) qb.andWhere('m.tipoMaterialId = :tipoMaterialId', { tipoMaterialId: query.tipoMaterialId });
    if (query.condicionMaterialId) qb.andWhere('m.condicionMaterialId = :condicionMaterialId', { condicionMaterialId: query.condicionMaterialId });
    if (query.loteId) qb.andWhere('m.loteId = :loteId', { loteId: query.loteId });
    if (query.fechaDesde) qb.andWhere('m.createdAt >= :fechaDesde', { fechaDesde: query.fechaDesde });
    if (query.fechaHasta) qb.andWhere('m.createdAt <= :fechaHasta', { fechaHasta: `${query.fechaHasta}T23:59:59` });

    const materiales = await qb.orderBy('m.id', 'ASC').getMany();
    if (!materiales.length) return [];

    const m = this.repo.manager;
    const medios = await m.find(MedioAlmacenamiento, { where: { materialId: In(materiales.map((x) => x.id)), isActive: true } });
    const mediosByMaterial = new Map(medios.map((ma) => [ma.materialId, ma]));

    const medioIds = medios.map((ma) => ma.id);
    const procesos = medioIds.length
      ? await m.find(ProcesoDestruccion, {
          where: { medioAlmacenamientoId: In(medioIds), isActive: true },
          relations: ['estado', 'metodoDestruccion'],
        })
      : [];
    const procesosByMedio = new Map(procesos.map((p) => [p.medioAlmacenamientoId, p]));

    const result = materiales.map((mat) => {
      const medio = mediosByMaterial.get(mat.id);
      const proceso = medio ? procesosByMedio.get(medio.id) ?? null : null;
      return { ...mat, medioAlmacenamiento: medio ? { ...medio, procesoDestruccion: proceso } : null };
    });

    if (query.tieneDestruccion === true) return result.filter((r) => r.medioAlmacenamiento !== null);
    if (query.tieneDestruccion === false) return result.filter((r) => r.medioAlmacenamiento === null);
    return result;
  }
}
