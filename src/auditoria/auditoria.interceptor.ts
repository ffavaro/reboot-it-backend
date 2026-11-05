import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditoriaService } from './auditoria.service';
import { RespuestaConId, RESULTADO, Resultado } from '../interfaces/auditoria.types';
const { describirAccion, NO_AUDITAR } = require('./entities/listado-acciones');

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditoria: AuditoriaService,
    private readonly config: ConfigService,
  ) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    if(context.getType() !== 'http') return next.handle();

    if (this.reflector.getAllAndOverride<boolean>(NO_AUDITAR, [context.getHandler(), context.getClass()])) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const codigoEsperado =
      this.reflector.get<number>(HTTP_CODE_METADATA, context.getHandler()) ??
      (req.method === 'POST' ? 201 : 200);
    const registrarLecturas =
      this.config.get<string>('AUDITORIA_REGISTRAR_LECTURAS') !== 'false';

    return next.handle().pipe(
      tap({
        next: (respuesta: any) => {
          if (req.method === 'GET' && !registrarLecturas) return;
          void this.auditar(req, codigoEsperado, RESULTADO.EXITO, respuesta);
        },
        error: (error: any) => {
          const codigo =
            error instanceof HttpException ? error.getStatus() : 500;
          void this.auditar(req, codigo, RESULTADO.ERROR);
        },
      }),
    );

 }

  private idAfectado(req: Request, respuesta?: any): number | null {
    const delParametro = Number(req.params?.id);
    if (Number.isFinite(delParametro)) return delParametro;

    const datos = respuesta as RespuestaConId | undefined;
    const id = datos?.id;
    if (typeof id === 'number' && Number.isFinite(id)) return id;

    const hojaRutaId = datos?.hojaRuta?.id;
    if (typeof hojaRutaId === 'number' && Number.isFinite(hojaRutaId)) return hojaRutaId;
    return null;
  }

 private async auditar (
    req: Request,
    codeHttp: number,
    resultado: Resultado,
    respuesta?: any,
  ) {
    const patron = (req.route as { path?: string } | undefined)?.path;
    const { accion, entidad } = describirAccion(req.method, patron);
    const usuarioIntentado = this.auditoria.obtenerUsuarioIntentado(req);

    await this.auditoria.guardarAuditoria({
        ...this.auditoria.obtenerRequest(req),
        usuarioId: usuarioIntentado?.id ?? null,
        rol:  usuarioIntentado?.rol?.nombre ?? null,
        accion,
        codigoHttp: codeHttp,
        resultado,
        entidad,
        entidadId: this.idAfectado(req, respuesta),
        usuarioIntentado: usuarioIntentado?.username ?? null,
    })
 }
}
