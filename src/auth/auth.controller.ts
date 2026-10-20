import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from './auth.decorators';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NoAuditar } from '../auditoria/auditoria.acciones';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly auditoria: AuditoriaService,
    ) { }

    @Public()
    // El login se registra en AuthService (con el usuario intentado y si salió bien o mal),
    // así que se excluye de la auditoría automática para no duplicarlo
    @NoAuditar()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string, any>, @Req() req: Request) {
        return this.authService.signIn(signInDto.email, signInDto.password, this.auditoria.contextoDe(req));
    }

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    signUp(@Body() signUpDto: RegisterDto) {
        return this.authService.signUp(signUpDto);
    }
}
