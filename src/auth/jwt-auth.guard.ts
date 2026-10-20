import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './auth.decorators';
import { AuthUser, RequestConUsuario } from './auth-user';
import { AuditoriaService, RESULTADO_ERROR } from '../auditoria/auditoria.service';
import { describirAccion } from '../auditoria/auditoria.acciones';

/**
 * Guard global: toda ruta exige un JWT válido (header Authorization: Bearer <token>),
 * salvo las marcadas con @Public(). Deja el usuario del token en request.user.
 * Los rechazos quedan registrados en la auditoría (los guards corren antes que los interceptores).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    const tieneToken = tipo === 'Bearer' && !!token;

    if (esPublica) {
      // Ruta abierta: no exige token, pero si llega uno válido se deja el usuario en request.user para que
      // la auditoría sepa quién hizo la consulta (si no, se registraría como anónimo). Nunca se rechaza.
      if (tieneToken) {
        try {
          request.user = await this.jwtService.verifyAsync<AuthUser>(token);
        } catch {
          // token inválido en una ruta abierta: se ignora
        }
      }
      return true;
    }

    if (!tieneToken) {
      this.registrarRechazo(request, 'Acceso sin token rechazado');
      throw new UnauthorizedException('Falta el token de autenticación. Iniciá sesión para continuar.');
    }

    try {
      request.user = await this.jwtService.verifyAsync<AuthUser>(token);
    } catch {
      this.registrarRechazo(request, 'Acceso con token inválido o vencido rechazado');
      throw new UnauthorizedException('Tu sesión es inválida o venció. Iniciá sesión nuevamente.');
    }
    return true;
  }

  private registrarRechazo(request: RequestConUsuario, accion: string) {
    // Sin await: no demora la respuesta; registrar() nunca lanza
    void this.auditoria.registrar({
      ...this.auditoria.contextoDe(request),
      accion,
      resultado: RESULTADO_ERROR,
      codigoHttp: 401,
      entidad: describirAccion(request.method, request.route?.path).entidad,
    });
  }
}
