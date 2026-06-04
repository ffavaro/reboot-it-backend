import { UsuariosService } from '@app/usuarios/usuarios.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsuariosService,
        private readonly jwtService: JwtService
    ) { }

    async signIn(email: string, pass: string): Promise<{access_token: string}> {
        const user = await this.usersService.findByEmail(email);
        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const { password, ...result } = user;
        const access_token = this.jwtService.sign(result);
        return { access_token };
    }

    async signUp(name: string, email: string, password: string, cuitDni: string): Promise<{access_token: string}> {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new UnauthorizedException('Email ya registrado');
        }
        await this.usersService.create({ nombre: name, email, password, cuitDni, rolId: 7, isActive: true, empleadoId: undefined });
        const fullUser = await this.usersService.findByEmail(email);
        const { password: _, ...result } = fullUser!;
        const access_token = this.jwtService.sign(result);
        return { access_token };
    }
}
