import { UsuariosService } from '@app/usuarios/usuarios.service';
import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ROL_ID_DONANTE } from './auth.decorators';
import { AuditoriaService, ContextoAuditoria, RESULTADO_ERROR, RESULTADO_EXITO } from '../auditoria/auditoria.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly auditoria: AuditoriaService,
    ) { }

    // ctx: datos de la request (ip, user-agent, método y ruta) para dejar el intento en la auditoría
    async signIn(email: string, pass: string, ctx: ContextoAuditoria): Promise<{access_token: string}> {
        const emailIntentado = typeof email === 'string' ? email : '';
        const user = emailIntentado ? await this.usersService.findByEmail(emailIntentado) : null;
        const claveValida = !!user && typeof pass === 'string' && (await bcrypt.compare(pass, user.password));

        if (!user || !claveValida) {
            // usuarioId queda en NULL si el email no existe; usuarioIntentado dice qué se probó.
            // Nunca se guarda la contraseña intentada.
            void this.auditoria.registrar({
                ...ctx,
                usuarioId: user?.id ?? null,
                rol: user?.rol?.nombre ?? null,
                usuarioIntentado: emailIntentado || null,
                accion: 'Intento de inicio de sesión fallido',
                resultado: RESULTADO_ERROR,
                codigoHttp: 401,
                entidad: 'auth',
                entidadId: user?.id ?? null,
            });
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Las credenciales son correctas pero el acceso fue inhabilitado (empleado o usuario desactivado)
        if (!user.isActive) {
            void this.auditoria.registrar({
                ...ctx,
                usuarioId: user.id,
                rol: user.rol?.nombre ?? null,
                usuarioIntentado: emailIntentado,
                accion: 'Intento de inicio de sesión con usuario desactivado',
                resultado: RESULTADO_ERROR,
                codigoHttp: 403,
                entidad: 'auth',
                entidadId: user.id,
            });
            throw new ForbiddenException('Tu usuario está desactivado. Contactá al administrador.');
        }

        const { password, ...result } = user;
        const access_token = this.jwtService.sign(result);
        void this.auditoria.registrar({
            ...ctx,
            usuarioId: user.id,
            rol: user.rol?.nombre ?? null,
            usuarioIntentado: emailIntentado,
            accion: 'Inicio de sesión',
            resultado: RESULTADO_EXITO,
            codigoHttp: 200,
            entidad: 'auth',
            entidadId: user.id,
        });
        return { access_token };
    }

    async signUp({ name, apellido, email, password, cuitDni }: RegisterDto): Promise<{access_token: string}> {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }
        await this.usersService.create({ nombre: name, apellido, email, password, cuitDni, rolId: ROL_ID_DONANTE, isActive: true, empleadoId: undefined });
        const fullUser = await this.usersService.findByEmail(email);
        const { password: _, ...result } = fullUser!;
        const access_token = this.jwtService.sign(result);
        return { access_token };
    }
}
