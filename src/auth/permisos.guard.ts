import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { ACCION_POR_METODO } from '../permisos/permisos.constants';
import type { Accion } from '../permisos/permisos.constants';
import { PermisosService } from '../permisos/permisos.service';
import { ACCION_KEY, PANTALLAS_KEY, SOLO_ALCANCE_TOTAL_KEY } from './permisos.decorators';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permisos: PermisosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const objetivos = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, objetivos)) return true;

    const pantallas = this.reflector.getAllAndOverride<string[] | undefined>(PANTALLAS_KEY, objetivos);
    if (!pantallas?.length) return true;

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    if (!request.user) throw new UnauthorizedException('Iniciá sesión para continuar.');

    const accion =
      this.reflector.getAllAndOverride<Accion | undefined>(ACCION_KEY, objetivos) ??
      ACCION_POR_METODO[request.method] ??
      'ver';
    const alcance = await this.permisos.alcanceConcedido(request.user.rolId, pantallas, accion);
    if (!alcance) throw new ForbiddenException('No tenés permisos para realizar esta acción.');

    const soloTotal = this.reflector.getAllAndOverride<boolean>(SOLO_ALCANCE_TOTAL_KEY, objetivos);
    if (soloTotal && alcance !== 'TODOS') {
      throw new ForbiddenException('Esta operación la realiza el equipo de Reboot IT.');
    }

    request.acceso = { pantallas, accion, alcance };
    return true;
  }
}
