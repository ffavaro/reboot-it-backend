import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { Auditoria } from './entities/auditoria.entity';
import type { Request } from 'express';
import {
  EventoAuditoria,
} from '../interfaces/auditoria.types';

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

   constructor(
    @InjectRepository(Auditoria)
    private readonly logRepository: Repository<Auditoria>,
    private readonly jwtService: JwtService,
  ) {}

   obtenerRequest (req: Request) {
    const request = req.headers['x-forwarded-for'];
    const primera = request ? request[0] : request?.split(',')[0];
    
    const ip = (primera || req.ip || req.socket?.remoteAddress || '')
      .trim()
      .replace(/^::ffff:/, '');

    return {
      ip: ip? ip.slice(0, 45) : null,
      userAgent: (req.headers['user-agent'] ?? '').slice(0, 255),
      metodo: req.method,
      ruta: (req.originalUrl ?? req.url ?? '').split('?')[0].slice(0, 255),
    };
   } 

   obtenerUsuarioIntentado (req: Request & { user?: any}) {
    if(req.user) return req.user;
    
    const [ tipo, token] = req.headers.authorization?.split(' ') ?? [];
    if(tipo !== 'Bearer' || !token) return null;

    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      this.logger.error('Error al verificar el token JWT', error);
      return null;
    }
  }
 
  guardarAuditoria = async (evento: EventoAuditoria) => {
    try {
       await this.logRepository.save({usuarioId: evento.usuarioId ?? null,
        fechaHora: new Date(),
        accion: evento.accion.slice(0, 100),
        resultado: evento.resultado,
        ip: evento.ip?.slice(0, 45),
        usuarioIntentado: evento.usuarioIntentado?.slice(0, 150),
        rol: evento.rol?.slice(0, 50),
        metodo: evento.metodo?.slice(0, 10),
        ruta: evento.ruta?.slice(0, 255),
        entidad: evento.entidad?.slice(0, 100),
        entidadId: evento.entidadId ?? null,
        codigoHttp: evento.codigoHttp ?? null,
        userAgent: evento.userAgent?.slice(0, 255),})
    } catch (error) {
      this.logger.error('Error al guardar auditoría', error);
    }
  }

  findAcciones = async (filtros: CreateAuditoriaDto) => {
    const page = Number(filtros.page) ?? 1;
    const limit = Number(filtros.limit) ?? 20;

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

  obtenerAccionesUnicas = async (): Promise<string[]> => {
    const acciones = await this.logRepository
      .createQueryBuilder('l')
      .select('DISTINCT l.accion', 'accion')
      .orderBy('l.accion', 'ASC')
      .getRawMany<{ accion: string }>();
      return acciones.map((a) => a.accion);
  }

}
