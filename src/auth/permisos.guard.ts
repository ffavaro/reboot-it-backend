import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCION_KEY, IS_PUBLIC_KEY, PANTALLAS_KEY } from './auth.decorators';
import { RequestConUsuario } from './auth-user';
import { AuditoriaService, RESULTADO_ERROR } from '../auditoria/auditoria.service';
import { describirAccion } from '../auditoria/auditoria.acciones';
import { PermisosService } from '../permisos/permisos.service';
import { Accion, ACCION_POR_METODO } from '../permisos/permisos.constants';

/**
 * Guard global de permisos. Sin @Pantalla (o con @Authenticated) alcanza con estar autenticado.
 * Con @Pantalla(...) el rol del token tiene que tener, en la matriz de permisos de la base, la acción
 * (ver / crear / editar / baja) sobre alguna de esas pantallas. Los accesos denegados quedan en la auditoría.
 * El alcance concedido (PLENO, PROPIO, ASIGNADO, LIMITADO) queda en request.permiso para que los servicios
 * apliquen sus reglas por registro.
 */
@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditoria: AuditoriaService,
    private readonly permisos: PermisosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const objetivos = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, objetivos)) return true;

    const pantallas = this.reflector.getAllAndOverride<string[] | undefined>(PANTALLAS_KEY, objetivos);
    if (!pantallas || pantallas.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const user = request.user;
    if (!user) throw new UnauthorizedException('Iniciá sesión para continuar.');

    const accion: Accion =
      this.reflector.getAllAndOverride<Accion | undefined>(ACCION_KEY, objetivos) ?? ACCION_POR_METODO[request.method] ?? 'ver';
    const alcance = await this.permisos.alcance(user.rolId, pantallas, accion);

    if (alcance === 'NINGUNO') {
      const { accion: descripcion, entidad } = describirAccion(request.method, request.route?.path);
      // Sin await: no demora la respuesta; registrar() nunca lanza
      void this.auditoria.registrar({
        ...this.auditoria.contextoDe(request),
        usuarioId: user.id,
        rol: user.rol?.nombre ?? null,
        accion: `Acceso denegado: ${descripcion}`,
        resultado: RESULTADO_ERROR,
        codigoHttp: 403,
        entidad,
      });
      throw new ForbiddenException('No tenés permisos para realizar esta acción.');
    }
    request.permiso = { pantallas, accion, alcance };
    return true;
  }
}
