import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Usuario } from '../usuarios/usuario.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetCode } from './password-reset-code.entity';

// Mismo costo de hash que el resto del proyecto (UsuariosService)
const SALT_ROUNDS = 10;

export const MENSAJE_CODIGO_ENVIADO = 'Si el email está registrado, vas a recibir un código para restablecer tu contraseña.';
export const MENSAJE_CONTRASENA_ACTUALIZADA = 'Tu contraseña fue actualizada correctamente.';
const ERROR_CODIGO_INVALIDO = 'El código es inválido o expiró. Solicitá uno nuevo.';
const ERROR_INTENTOS = 'Superaste la cantidad de intentos. Solicitá un nuevo código.';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(PasswordResetCode) private readonly codigos: Repository<PasswordResetCode>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private get minutosValidez() {
    return Number(this.config.get('RESET_CODE_TTL_MINUTES')) || 15;
  }

  private get maxIntentos() {
    return Number(this.config.get('RESET_CODE_MAX_ATTEMPTS')) || 5;
  }

  /** Genera y envía el código. Responde siempre lo mismo, exista o no el email, para no revelar quién está registrado. */
  async forgotPassword(email: string, ip: string | null): Promise<{ message: string }> {
    const usuario = await this.usuarios.findOne({ where: { email } });
    if (!usuario || !usuario.isActive) return { message: MENSAJE_CODIGO_ENVIADO };

    // un solo código vigente por usuario: los anteriores sin usar quedan invalidados
    await this.codigos.update({ userId: usuario.id, usedAt: IsNull() }, { usedAt: new Date() });

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.codigos.save(
      this.codigos.create({
        userId: usuario.id,
        codeHash: await bcrypt.hash(code, SALT_ROUNDS),
        expiresAt: new Date(Date.now() + this.minutosValidez * 60_000),
        attempts: 0,
        usedAt: null,
        requestIp: ip ? ip.slice(0, 45) : null,
      }),
    );

    // si el proveedor falla se registra en el log (MailService) pero la respuesta no cambia
    await this.mail.sendPasswordResetCode(usuario.email, usuario.nombre, code, this.minutosValidez);
    return { message: MENSAJE_CODIGO_ENVIADO };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const usuario = await this.usuarios.findOne({ where: { email: dto.email } });
    if (!usuario || !usuario.isActive) throw new BadRequestException(ERROR_CODIGO_INVALIDO);

    const codigo = await this.codigos.findOne({
      where: { userId: usuario.id, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { id: 'DESC' },
    });
    if (!codigo) throw new BadRequestException(ERROR_CODIGO_INVALIDO);

    if (codigo.attempts >= this.maxIntentos) {
      await this.codigos.update(codigo.id, { usedAt: new Date() });
      throw new BadRequestException(ERROR_INTENTOS);
    }

    if (!(await bcrypt.compare(dto.code, codigo.codeHash))) {
      await this.codigos.increment({ id: codigo.id }, 'attempts', 1);
      throw new BadRequestException(ERROR_CODIGO_INVALIDO);
    }

    // contraseña nueva y código usado, juntos o ninguno
    const hash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    const ahora = new Date();
    await this.codigos.manager.transaction(async (m) => {
      await m.update(Usuario, usuario.id, { password: hash });
      await m.update(PasswordResetCode, codigo.id, { usedAt: ahora });
    });
    // El sistema usa JWT sin estado (no hay refresh tokens ni sesiones guardadas): las sesiones abiertas vencen solas
    // según JWT_EXPIRES_IN.

    await this.mail.sendPasswordChangedNotice(usuario.email, usuario.nombre, ahora);
    return { message: MENSAJE_CONTRASENA_ACTUALIZADA };
  }
}
