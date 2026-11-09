import { Body, Controller, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RestablecerContrasenaDto, SolicitarCodigoDto } from '../password-reset-code/dto/create-password-reset-code.dto';
import { RecuperacionContrasenaService } from '../password-reset-code/password-reset-code.service';
import { Public } from './public.decorator';

const QUINCE_MINUTOS = 15 * 60_000;

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly recuperacion: RecuperacionContrasenaService,
    ) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    signUp(@Body() signUpDto: Record<string, any>) {
        return this.authService.signUp(signUpDto.name, signUpDto.apellido, signUpDto.email, signUpDto.password, signUpDto.cuitDni);
    }
    
    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: QUINCE_MINUTOS } })
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    solicitarCodigo(@Body() dto: SolicitarCodigoDto, @Ip() ip: string) {
        return this.recuperacion.solicitarCodigo(dto.email, ip);
    }
    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: QUINCE_MINUTOS } })
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    restablecer(@Body() dto: RestablecerContrasenaDto) {
        return this.recuperacion.restablecer(dto);
    }
}