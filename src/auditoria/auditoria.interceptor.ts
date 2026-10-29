import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { RequestConUsuario } from '../auth/auth-user';
import { AuditoriaService, RESULTADO_ERROR, RESULTADO_EXITO } from './auditoria.service';
import { NO_AUDITAR_KEY, describirAccion } from './auditoria.acciones';

// tope de un INT de MySQL: un id mayor (ej. /donacion/99999999999) rompería el insert de entidad_id
const ID_MAXIMO = 2147483647;
const esId = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= ID_MAXIMO;

/**
 * Interceptor global: registra en `logacceso` cada request que llega a un endpoint, con su resultado.
 * Los rechazos de los guards (sin token, token inválido, rol sin permiso) los registran los propios
 * guards, porque se producen antes de que corran los interceptores. El login se registra en AuthService.
 * No se guarda el body de las requests, así que nunca quedan contraseñas ni tokens.
 *
 * AUDITORIA_REGISTRAR_LECTURAS=false evita registrar las consultas (GET) exitosas, que son la mayoría
 * del volumen; los GET con error y todo el resto se registran siempre.
 */
@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditoria: AuditoriaService,
    private readonly config: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    if (this.reflector.getAllAndOverride<boolean>(NO_AUDITAR_KEY, [context.getHandler(), context.getClass()])) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    const registrarLecturas = this.config.get<string>('AUDITORIA_REGISTRAR_LECTURAS') !== 'false';
    // Nest fija el código de estado después de los interceptores, así que acá se calcula el esperado
    const codigoExito: number = Reflect.getMetadata('__httpCode__', context.getHandler()) ?? (req.method === 'POST' ? 201 : 200);

    return next.handle().pipe(
      tap({
        next: (body) => {
          if (req.method === 'GET' && !registrarLecturas) return;
          this.guardar(req, codigoExito, RESULTADO_EXITO, body);
        },
        error: (err) => this.guardar(req, err instanceof HttpException ? err.getStatus() : 500, RESULTADO_ERROR),
      }),
    );
  }

  private guardar(req: RequestConUsuario, codigoHttp: number, resultado: typeof RESULTADO_EXITO | typeof RESULTADO_ERROR, body?: any) {
    const { accion, entidad } = describirAccion(req.method, req.route?.path);
    const idParam = Number(req.params?.id);
    const entidadId = esId(idParam) ? idParam : esId(body?.id) ? body.id : esId(body?.hojaRuta?.id) ? body.hojaRuta.id : null;

    // Sin await: la auditoría no demora la respuesta, y registrar() nunca lanza
    void this.auditoria.registrar({
      ...this.auditoria.contextoDe(req),
      usuarioId: req.user?.id ?? null,
      rol: req.user?.rol?.nombre ?? null,
      accion,
      resultado,
      codigoHttp,
      entidad,
      entidadId,
      // en /auth/register queda el email intentado (nunca la contraseña)
      usuarioIntentado: entidad === 'auth' && typeof req.body?.email === 'string' ? req.body.email : null,
    });
  }
}
