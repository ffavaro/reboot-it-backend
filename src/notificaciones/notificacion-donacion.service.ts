import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { MailService } from '../mail/mail.service';
import { Turno } from '../turno/turno.entity';
import { Usuario } from '../usuarios/usuario.entity';

/**
 * Avisa por email al donante cuando cambia el estado de su donación. Nunca interrumpe la operación que cambió el
 * estado: si algo falla (el donante no tiene usuario, el proveedor de email rechaza el envío) se registra en el log.
 *
 * Uso: `const antes = await notificaciones.estadoActual(id)`, se cambia el estado y después
 * `void notificaciones.estadoCambiado(id, antes)`.
 */
@Injectable()
export class NotificacionDonacionService {
  private readonly logger = new Logger(NotificacionDonacionService.name);

  constructor(
    @InjectRepository(Donacion) private readonly donaciones: Repository<Donacion>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Turno) private readonly turnos: Repository<Turno>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async estadoActual(donacionId: number): Promise<number | null> {
    try {
      const d = await this.donaciones.findOne({ where: { id: donacionId } });
      return d?.estadoDonacionId ?? null;
    } catch {
      return null;
    }
  }

  async estadoCambiado(donacionId: number, estadoAnteriorId: number | null): Promise<void> {
    try {
      const donacion = await this.donaciones.findOne({ where: { id: donacionId }, relations: ['donante', 'estadoDonacion'] });
      if (!donacion || donacion.estadoDonacionId == null || donacion.estadoDonacionId === estadoAnteriorId) return;
      const donante = donacion.donante;
      const usuario = donante?.usuarioId ? await this.usuarios.findOne({ where: { id: donante.usuarioId } }) : null;
      if (!usuario?.email || !usuario.isActive) return;
      // el email también cuenta cómo está el turno de esa donación
      const turno = await this.turnos.findOne({ where: { donacionId, isActive: true }, relations: ['estadoTurno'], order: { createdAt: 'DESC' } });
      const frontend = (this.config.get<string>('FRONTEND_URL') ?? '').trim().replace(/\/$/, '');
      await this.mail.sendDonationStatusChange(
        usuario.email,
        donante.nombre || usuario.nombre,
        donacion.id,
        donacion.estadoDonacion?.descripcion ?? 'Sin estado',
        frontend ? `${frontend}/pages/donacion` : undefined,
        turno?.estadoTurno?.descripcion ?? null,
      );
    } catch (error) {
      this.logger.error(`No se pudo avisar el cambio de estado de la donación: ${error instanceof Error ? error.message : 'error desconocido'}`);
    }
  }
}
