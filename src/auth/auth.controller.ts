import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './password-reset.service';
import { Public } from './auth.decorators';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NoAuditar } from '../auditoria/auditoria.acciones';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly auditoria: AuditoriaService,
        private readonly passwordReset: PasswordResetService,
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

    // Recuperar contraseña: 1) se pide el código por email, 2) se lo ingresa con la contraseña nueva
    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 15 * 60 * 1000 } })
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
        return this.passwordReset.forgotPassword(dto.email, req.ip ?? null);
    }

    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.passwordReset.resetPassword(dto);
    }
}
