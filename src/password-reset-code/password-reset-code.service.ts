import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Usuario } from '../usuarios/usuario.entity';
import { RestablecerContrasenaDto } from '../password-reset-code/dto/create-password-reset-code.dto';
import { PasswordResetCode } from './entities/password-reset-code.entity';

const SALT_ROUNDS = 10;
const MINUTOS_VALIDEZ_POR_DEFECTO = 15;
const INTENTOS_POR_DEFECTO = 5;

export const CODIGO_ENVIADO =
  'Si el email está registrado, vas a recibir un código para restablecer tu contraseña.';
export const CONTRASENA_ACTUALIZADA =
  'Tu contraseña fue actualizada correctamente.';
export const CODIGO_INVALIDO =
  'El código es inválido o expiró. Solicitá uno nuevo.';
export const DEMASIADOS_INTENTOS =
  'Superaste la cantidad de intentos. Solicitá un nuevo código.';

@Injectable()
export class RecuperacionContrasenaService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(PasswordResetCode)
    private readonly codigoRepository: Repository<PasswordResetCode>,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async solicitarCodigo(
    email: string,
    ip?: string | null,
  ): Promise<{ message: string }> {
    const usuario = await this.usuarioActivo(email);
    if (!usuario) return { message: CODIGO_ENVIADO };

    await this.codigoRepository.update(
      { userId: usuario.id, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const minutos = this.minutosValidez();

    await this.codigoRepository.save(
      this.codigoRepository.create({
        userId: usuario.id,
        codeHash: await bcrypt.hash(codigo, SALT_ROUNDS),
        expiresAt: new Date(Date.now() + minutos * 60_000),
        attempts: 0,
        usedAt: null,
        requestIp: ip?.slice(0, 45) ?? null,
      }),
    );

    await this.mailService.enviarCodigoRecuperacion(
      usuario.email,
      usuario.nombre,
      codigo,
      minutos,
    );
    return { message: CODIGO_ENVIADO };
  }

  async restablecer(
    dto: RestablecerContrasenaDto,
  ): Promise<{ message: string }> {
    const usuario = await this.usuarioActivo(dto.email);
    if (!usuario) throw new BadRequestException(CODIGO_INVALIDO);

    const vigente = await this.codigoRepository.findOne({
      where: {
        userId: usuario.id,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { id: 'DESC' },
    });
    if (!vigente) throw new BadRequestException(CODIGO_INVALIDO);

    if (vigente.attempts >= this.maxIntentos()) {
      await this.codigoRepository.update(vigente.id, { usedAt: new Date() });
      throw new BadRequestException(DEMASIADOS_INTENTOS);
    }

    const coincide = await bcrypt.compare(dto.code, vigente.codeHash);
    if (!coincide) {
      await this.codigoRepository.increment({ id: vigente.id }, 'attempts', 1);
      throw new BadRequestException(CODIGO_INVALIDO);
    }

    const ahora = new Date();
    const nuevaClave = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.codigoRepository.manager.transaction(async (m) => {
      await m.update(Usuario, usuario.id, { password: nuevaClave });
      await m.update(PasswordResetCode, vigente.id, { usedAt: ahora });
    });

    await this.mailService.enviarAvisoCambioContrasena(
      usuario.email,
      usuario.nombre,
      ahora,
    );
    return { message: CONTRASENA_ACTUALIZADA };
  }

  private async usuarioActivo(email: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { email } });
    return usuario?.isActive ? usuario : null;
  }

  private minutosValidez(): number {
    return (
      Number(this.config.get('RESET_CODE_TTL_MINUTES')) ||
      MINUTOS_VALIDEZ_POR_DEFECTO
    );
  }

  private maxIntentos(): number {
    return (
      Number(this.config.get('RESET_CODE_MAX_ATTEMPTS')) || INTENTOS_POR_DEFECTO
    );
  }
}