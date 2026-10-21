import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcesoDestruccion } from './proceso-destruccion.entity';
import { CreateProcesoDestruccionDto } from './dto/create-proceso-destruccion.dto';
import { UpdateProcesoDestruccionDto } from './dto/update-proceso-destruccion.dto';
import { ReporteProcesoDestruccionDto } from './dto/reporte-proceso-destruccion.dto';
import { PermisosService } from '../permisos/permisos.service';
import { EstadoProcesoDestruccion } from '../estado-proceso-destruccion/estado-proceso-destruccion.entity';
import { PROCESO_DESTRUCCION_CERRADO } from '../common/constants/estados';

@Injectable()
export class ProcesoDestruccionService {
  constructor(
    @InjectRepository(ProcesoDestruccion)
    private readonly procesoDestruccionRepository: Repository<ProcesoDestruccion>,
    private readonly permisos: PermisosService,
  ) {}

  /**
   * Doble control: el Técnico ejecuta el proceso y el Administrativo lo valida y cierra. Pasar un proceso a un estado de
   * cierre (o modificar uno ya cerrado) requiere el permiso de baja sobre Proceso de destrucción, que el Técnico no tiene.
   */
  async validarCierre(rolId: number | undefined, estadoId: number | undefined, estadoActualId?: number) {
    const repo = this.procesoDestruccionRepository.manager.getRepository(EstadoProcesoDestruccion);
    const esCierre = async (id?: number) => {
      if (id === undefined) return false;
      const estado = await repo.findOne({ where: { id } });
      return !!estado && PROCESO_DESTRUCCION_CERRADO.test(estado.nombre);
    };
    if ((await esCierre(estadoId)) || (await esCierre(estadoActualId))) {
      if ((await this.permisos.alcance(rolId, ['proceso_destruccion'], 'baja')) === 'NINGUNO') {
        throw new ForbiddenException('Cerrar o validar un proceso de destrucción lo hace el Administrativo (doble control): el Técnico solo lo ejecuta.');
      }
    }
  }

  async create(dto: CreateProcesoDestruccionDto, rolId?: number) {
    await this.validarCierre(rolId, dto.estadoId);
    const procesoDestruccion = this.procesoDestruccionRepository.create(dto);
    return this.procesoDestruccionRepository.save(procesoDestruccion);
  }

  findAll() {
    return this.procesoDestruccionRepository.find({
      where: { isActive: true },
      relations: ['medioAlmacenamiento', 'medioAlmacenamiento.material', 'medioAlmacenamiento.material.tipoMaterial', 'empleado', 'metodoDestruccion', 'estado'],
    });
  }

  async findOne(id: number) {
    const procesoDestruccion = await this.procesoDestruccionRepository.findOne({
      where: { id },
      relations: ['medioAlmacenamiento', 'medioAlmacenamiento.material', 'medioAlmacenamiento.material.tipoMaterial', 'empleado', 'metodoDestruccion', 'estado'],
    });
    if (!procesoDestruccion) throw new NotFoundException(`ProcesoDestruccion ${id} no encontrado`);
    return procesoDestruccion;
  }

  async update(id: number, dto: UpdateProcesoDestruccionDto, rolId?: number) {
    const actual = await this.findOne(id);
    await this.validarCierre(rolId, dto.estadoId, actual.estadoId);
    await this.procesoDestruccionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.procesoDestruccionRepository.update(id, { isActive: false });
    return { message: 'ProcesoDestruccion desactivado' };
  }

  async reporte(query: ReporteProcesoDestruccionDto) {
    const qb = this.procesoDestruccionRepository
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
