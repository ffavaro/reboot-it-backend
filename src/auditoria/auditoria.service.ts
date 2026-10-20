import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { LogAcceso } from './log-acceso.entity';
import { ListarAuditoriaQueryDto } from './dto/listar-auditoria-query.dto';

export const RESULTADO_EXITO = 'Éxito';
export const RESULTADO_ERROR = 'Error';

// Datos de la request que se guardan siempre (nunca el body, ni headers de autenticación)
export interface ContextoAuditoria {
  ip: string | null;
  userAgent: string | null;
  metodo: string;
  ruta: string;
}

export interface RegistroAuditoria extends Partial<ContextoAuditoria> {
  usuarioId?: number | null;
  rol?: string | null;
  accion: string;
  resultado: typeof RESULTADO_EXITO | typeof RESULTADO_ERROR;
  codigoHttp?: number | null;
  entidad?: string | null;
  entidadId?: number | null;
  usuarioIntentado?: string | null;
}

const recortar = (v: string | null | undefined, max: number) => (v ? v.slice(0, max) : null);

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepository: Repository<LogAcceso>,
  ) {}

  /** IP (detrás de un proxy, la primera de x-forwarded-for), user-agent, método y ruta sin query string. */
  contextoDe(req: Request): ContextoAuditoria {
    const forwarded = req.headers['x-forwarded-for'];
    const crudo = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) || req.ip || req.socket?.remoteAddress || '';
    return {
      ip: recortar(crudo.trim().replace(/^::ffff:/, ''), 45),
      userAgent: recortar(req.headers['user-agent'], 255),
      metodo: req.method,
      ruta: (req.originalUrl ?? req.url ?? '').split('?')[0].slice(0, 255),
    };
  }

  /**
   * Guarda un registro de auditoría. NUNCA lanza: si falla la escritura se deja el error en el log
   * del servidor y la operación del usuario sigue como si nada.
   */
  async registrar(r: RegistroAuditoria): Promise<void> {
    try {
      await this.logRepository.insert({
        usuarioId: r.usuarioId ?? null,
        fechaHora: new Date(),
        accion: r.accion.slice(0, 100),
        resultado: r.resultado,
        ip: recortar(r.ip, 45),
        usuarioIntentado: recortar(r.usuarioIntentado, 150),
        rol: recortar(r.rol, 50),
        metodo: recortar(r.metodo, 10),
        ruta: recortar(r.ruta, 255),
        entidad: recortar(r.entidad, 100),
        entidadId: r.entidadId ?? null,
        codigoHttp: r.codigoHttp ?? null,
        userAgent: recortar(r.userAgent, 255),
      });
    } catch (error) {
      this.logger.error(`No se pudo registrar la auditoría (${r.accion}): ${(error as Error).message}`);
    }
  }

  async buscar(query: ListarAuditoriaQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.logRepository
      .createQueryBuilder('l')
      .leftJoin('l.usuario', 'u')
      .addSelect(['u.id', 'u.nombre', 'u.email'])
      .orderBy('l.fechaHora', 'DESC')
      .addOrderBy('l.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.usuarioId) qb.andWhere('l.usuarioId = :usuarioId', { usuarioId: query.usuarioId });
    if (query.fechaDesde) qb.andWhere('l.fechaHora >= :desde', { desde: query.fechaDesde.slice(0, 10) });
    if (query.fechaHasta) qb.andWhere('l.fechaHora < DATE_ADD(:hasta, INTERVAL 1 DAY)', { hasta: query.fechaHasta.slice(0, 10) });
    if (query.accion) qb.andWhere('l.accion LIKE :accion', { accion: `%${query.accion}%` });
    if (query.resultado) qb.andWhere('l.resultado = :resultado', { resultado: query.resultado });
    if (query.entidad) qb.andWhere('l.entidad = :entidad', { entidad: query.entidad });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }
}
