import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';
import { RequestConUsuario, UsuarioToken } from '@app/interfaces/auth.type';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService
    ) { }

    canActivate = async (context: ExecutionContext): Promise<boolean> => {
         const request = context.switchToHttp().getRequest<RequestConUsuario>();
        const token = this.tokenDe(request);
        const esPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (esPublica) {
            if (token) request.user = (await this.verificar(token) ?? undefined)
            return true;
        }

        if (!token) {
            throw new UnauthorizedException('Falta el token de autenticación. Iniciá sesión para continuar.')
        }

        const usuario = await this.verificar(token);
        if (!usuario) {
            throw new UnauthorizedException(
                'Tu sesión es inválida o venció. Iniciá sesión nuevamente.',
            );
        }
        request.user = usuario;
        return true;
    }

    private tokenDe(request: Request): string | null {
        const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
        return tipo === 'Bearer' && token ? token : null
    }

    private async verificar(token: string): Promise<UsuarioToken | null> {
        try {
            return await this.jwtService.verifyAsync<UsuarioToken>(token)
        } catch (error) {
            return null
        }
    }
}