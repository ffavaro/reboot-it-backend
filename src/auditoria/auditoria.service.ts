import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { Repository } from 'typeorm';
import {
  ContextoRequest,
  EventoAuditoria,
  UsuarioAuditado,
} from '../interfaces/auditoria.types';
import { ListarAuditoriaDto } from './dto/listar-auditoria.dto';
import { LogAcceso } from './entities/auditoria.entity';

const recortar = (valor: string | null | undefined, max: number) =>
  valor ? valor.slice(0, max) : null;

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepository: Repository<LogAcceso>,
    private readonly jwtService: JwtService,
  ) {}

  contextoDe(req: Request): ContextoRequest {
    const reenviada = req.headers['x-forwarded-for'];
    const primera = Array.isArray(reenviada)
      ? reenviada[0]
      : reenviada?.split(',')[0];
    const ip = (primera || req.ip || req.socket?.remoteAddress || '')
      .trim()
      .replace(/^::ffff:/, '');

    return {
      ip: recortar(ip, 45),
      userAgent: recortar(req.headers['user-agent'], 255),
      metodo: req.method,
      ruta: (req.originalUrl ?? req.url ?? '').split('?')[0].slice(0, 255),
    };
  }

  async usuarioDe(
    req: Request & { user?: UsuarioAuditado },
  ): Promise<UsuarioAuditado | null> {
    if (req.user) return req.user;

    const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) return null;

    try {
      return await this.jwtService.verifyAsync<UsuarioAuditado>(token);
    } catch {
      return null;
    }
  }

  async registrar(evento: EventoAuditoria): Promise<void> {
    try {
      await this.logRepository.insert({
        usuarioId: evento.usuarioId ?? null,
        fechaHora: new Date(),
        accion: evento.accion.slice(0, 100),
        resultado: evento.resultado,
        ip: recortar(evento.ip, 45),
        usuarioIntentado: recortar(evento.usuarioIntentado, 150),
        rol: recortar(evento.rol, 50),
        metodo: recortar(evento.metodo, 10),
        ruta: recortar(evento.ruta, 255),
        entidad: recortar(evento.entidad, 100),
        entidadId: evento.entidadId ?? null,
        codigoHttp: evento.codigoHttp ?? null,
        userAgent: recortar(evento.userAgent, 255),
      });
    } catch (error) {
      this.logger.error(
        `No se pudo guardar la auditoría (${evento.accion}): ${(error as Error).message}`,
      );
    }
  }

  async buscar(filtros: ListarAuditoriaDto) {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    const qb = this.logRepository
      .createQueryBuilder('l')
      .leftJoin('l.usuario', 'u')
      .addSelect(['u.id', 'u.nombre', 'u.email'])
      .orderBy('l.fechaHora', 'DESC')
      .addOrderBy('l.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filtros.usuarioId)
      qb.andWhere('l.usuarioId = :usuarioId', { usuarioId: filtros.usuarioId });
    if (filtros.fechaDesde)
      qb.andWhere('l.fechaHora >= :desde', {
        desde: filtros.fechaDesde.slice(0, 10),
      });
    if (filtros.fechaHasta) {
      qb.andWhere('l.fechaHora < DATE_ADD(:hasta, INTERVAL 1 DAY)', {
        hasta: filtros.fechaHasta.slice(0, 10),
      });
    }
    if (filtros.accion)
      qb.andWhere('l.accion LIKE :accion', { accion: `%${filtros.accion}%` });
    if (filtros.resultado)
      qb.andWhere('l.resultado = :resultado', { resultado: filtros.resultado });
    if (filtros.entidad)
      qb.andWhere('l.entidad = :entidad', { entidad: filtros.entidad });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async acciones(): Promise<string[]> {
    const filas = await this.logRepository
      .createQueryBuilder('l')
      .select('DISTINCT l.accion', 'accion')
      .orderBy('l.accion', 'ASC')
      .limit(300)
      .getRawMany<{ accion: string }>();
    return filas.map((f) => f.accion);
  }
}
