import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { MailService } from '../mail/mail.service';
import { Turno } from '../turno/turno.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class NotificacionDonacionService {
  private readonly logger = new Logger(NotificacionDonacionService.name);

  constructor(
    @InjectRepository(Donacion) private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(Usuario) private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Turno) private readonly turnoRepository: Repository<Turno>,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async notificarSiCambio(donacionId: number, estadoPrevio: number | null): Promise<void> {
    try {
      const donacion = await this.donacionRepository.findOne({
        where: { id: donacionId },
        relations: ['donante', 'estadoDonacion'],
      });
      if (!donacion || donacion.estadoDonacionId == null || donacion.estadoDonacionId === estadoPrevio) {
        return;
      }

      const usuario = await this.buscarUsuarioDelDonante(donacion);
      if (!usuario) {
        return;
      }

      const turno = await this.turnoRepository.findOne({
        where: { donacionId, isActive: true },
        relations: ['estadoTurno'],
        order: { createdAt: 'DESC' },
      });

      await this.mailService.enviarCambioEstadoDonacion(usuario.email, {
        nombre: donacion.donante.nombre || usuario.nombre,
        donacionId: donacion.id,
        estado: donacion.estadoDonacion?.descripcion ?? 'Sin estado',
        estadoTurno: turno?.estadoTurno?.descripcion ?? null,
        url: this.urlDonaciones(),
      });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'error desconocido';
      this.logger.error(`No se pudo notificar el cambio de estado de la donacion ${donacionId}: ${detalle}`);
    }
  }

  private async buscarUsuarioDelDonante(donacion: Donacion): Promise<Usuario | null> {
    const usuarioId = donacion.donante?.usuarioId;
    if (!usuarioId) {
      return null;
    }
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    return usuario?.email && usuario.isActive ? usuario : null;
  }

  private urlDonaciones(): string | undefined {
    const base = (this.config.get<string>('FRONTEND_URL') ?? '').trim().replace(/\/$/, '');
    return base ? `${base}/pages/donacion` : undefined;
  }
}
