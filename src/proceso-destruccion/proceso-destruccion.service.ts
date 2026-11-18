import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcesoDestruccion } from './proceso-destruccion.entity';
import { CreateProcesoDestruccionDto } from './dto/create-proceso-destruccion.dto';
import { UpdateProcesoDestruccionDto } from './dto/update-proceso-destruccion.dto';
import { ReporteProcesoDestruccionDto } from './dto/reporte-proceso-destruccion.dto';
import { CrudService } from '@app/common/crud/crud-service';

const RELATIONS = [
  'medioAlmacenamiento',
  'medioAlmacenamiento.material',
  'medioAlmacenamiento.material.tipoMaterial',
  'empleado',
  'metodoDestruccion',
  'estado',
];

@Injectable()
export class ProcesoDestruccionService extends CrudService<
  ProcesoDestruccion, CreateProcesoDestruccionDto, UpdateProcesoDestruccionDto
> {
  constructor(@InjectRepository(ProcesoDestruccion) repo: Repository<ProcesoDestruccion>) {
    super(repo, { etiqueta: 'ProcesoDestruccion', genero: 'm', relations: RELATIONS, order: { id: 'DESC' } });
  }

  async reporte(query: ReporteProcesoDestruccionDto) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.medioAlmacenamiento', 'medio')
      .leftJoinAndSelect('medio.material', 'material')
      .leftJoinAndSelect('material.tipoMaterial', 'tipoMaterial')
      .leftJoinAndSelect('p.metodoDestruccion', 'metodo')
      .leftJoinAndSelect('p.estado', 'estado')
      .leftJoinAndSelect('p.empleado', 'empleado')
      .where('p.isActive = :active', { active: true });

    if (query.estadoId) {
      qb.andWhere('p.estadoId = :estadoId', { estadoId: query.estadoId });
    }
    if (query.metodoDestruccionId) {
      qb.andWhere('p.metodoDestruccionId = :metodoDestruccionId', {
        metodoDestruccionId: query.metodoDestruccionId,
      });
    }
    if (query.empleadoId) {
      qb.andWhere('p.empleadoId = :empleadoId', { empleadoId: query.empleadoId });
    }
    if (query.fechaDesde) {
      qb.andWhere('p.fecha >= :fechaDesde', { fechaDesde: query.fechaDesde });
    }
    if (query.fechaHasta) {
      qb.andWhere('p.fecha <= :fechaHasta', { fechaHasta: query.fechaHasta });
    }

    return qb.orderBy('p.fecha', 'DESC').getMany();
  }
}
