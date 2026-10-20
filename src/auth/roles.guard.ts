import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, ROL, ROLES_KEY, RolPermitido } from './auth.decorators';
import { RequestConUsuario } from './auth-user';

// Marcas diacríticas combinantes (U+0300 a U+036F) que deja normalize("NFD") al separar las tildes
const TILDES = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
const sinTildes = (s: string) => s.normalize("NFD").replace(TILDES, "").toLowerCase().trim();

// Roles que el menú del frontend restringe a sus propias pantallas; el resto es "staff"
const ROLES_EXTERNOS: string[] = [ROL.DONANTE, ROL.TRANSPORTISTA];

/**
 * Guard global de roles. Sin @Roles (o con @Authenticated) alcanza con estar autenticado.
 * Con @Roles(...) el rol del token tiene que estar entre los indicados; ROL.STAFF equivale a
 * "cualquier rol que no sea Donante ni Transportista" (igual que el menú del frontend).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const esPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (esPublica) return true;

    const permitidos = this.reflector.getAllAndOverride<RolPermitido[] | undefined>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!permitidos || permitidos.length === 0) return true;

    const user = context.switchToHttp().getRequest<RequestConUsuario>().user;
    if (!user) throw new UnauthorizedException('Iniciá sesión para continuar.');

    const rol = user.rol?.nombre ? sinTildes(user.rol.nombre) : '';
    const autorizado =
      !!rol &&
      (permitidos.includes(rol as RolPermitido) || (permitidos.includes(ROL.STAFF) && !ROLES_EXTERNOS.includes(rol)));
    if (!autorizado) throw new ForbiddenException('No tenés permisos para realizar esta acción.');
    return true;
  }
}
