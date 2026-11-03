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
import { describirAccion, NO_AUDITAR } from './acciones';
import { AuditoriaService } from './auditoria.service';
import { RESULTADO, Resultado } from '../interfaces/auditoria.types';

const MAX_INT = 2_147_483_647;

const esId = (valor: unknown): valor is number =>
  typeof valor === 'number' &&
  Number.isInteger(valor) &&
  valor > 0 &&
  valor <= MAX_INT;

interface RespuestaConId {
  id?: unknown;
  hojaRuta?: { id?: unknown };
}

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditoria: AuditoriaService,
    private readonly config: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const omitir = this.reflector.getAllAndOverride<boolean>(NO_AUDITAR, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (omitir) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const codigoEsperado =
      this.reflector.get<number>(HTTP_CODE_METADATA, context.getHandler()) ??
      (req.method === 'POST' ? 201 : 200);
    const registrarLecturas =
      this.config.get<string>('AUDITORIA_REGISTRAR_LECTURAS') !== 'false';

    return next.handle().pipe(
      tap({
        next: (respuesta: unknown) => {
          if (req.method === 'GET' && !registrarLecturas) return;
          void this.guardar(req, codigoEsperado, RESULTADO.EXITO, respuesta);
        },
        error: (error: unknown) => {
          const codigo =
            error instanceof HttpException ? error.getStatus() : 500;
          void this.guardar(req, codigo, RESULTADO.ERROR);
        },
      }),
    );
  }

  private async guardar(
    req: Request,
    codigoHttp: number,
    resultado: Resultado,
    respuesta?: unknown,
  ) {
    const patron = (req.route as { path?: string } | undefined)?.path;
    const { accion, entidad } = describirAccion(req.method, patron);
    const usuario = await this.auditoria.usuarioDe(req);
    const body = req.body as { email?: unknown } | undefined;

    await this.auditoria.registrar({
      ...this.auditoria.contextoDe(req),
      usuarioId: usuario?.id ?? null,
      rol: usuario?.rol?.nombre ?? null,
      accion,
      resultado,
      codigoHttp,
      entidad,
      entidadId: this.idAfectado(req, respuesta),
      usuarioIntentado:
        entidad === 'auth' && typeof body?.email === 'string'
          ? body.email
          : null,
    });
  }

  private idAfectado(req: Request, respuesta?: unknown): number | null {
    const delParametro = Number(req.params?.id);
    if (esId(delParametro)) return delParametro;

    const datos = respuesta as RespuestaConId | undefined;
    if (esId(datos?.id)) return datos.id;
    if (esId(datos?.hojaRuta?.id)) return datos.hojaRuta.id;
    return null;
  }
}
