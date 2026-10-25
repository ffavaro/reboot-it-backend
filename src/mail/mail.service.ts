import { Injectable, Logger } from '@nestjs/common';
import { MailProvider } from './mail-provider';
import { plantillaCambioContrasena, plantillaCodigo, plantillaEstadoDonacion } from './mail.templates';

/**
 * Emails del sistema. Si el proveedor falla se registra el error (sin datos sensibles: ni el código ni el email) y se
 * devuelve false: quien llama decide si eso interrumpe su operación.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly provider: MailProvider) {}

  async sendPasswordResetCode(to: string, nombre: string, code: string, minutosValidez: number): Promise<boolean> {
    return this.enviar(to, plantillaCodigo(nombre, code, minutosValidez), 'código de recuperación');
  }

  async sendPasswordChangedNotice(to: string, nombre: string, fecha: Date): Promise<boolean> {
    const texto = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Cordoba',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(fecha);
    return this.enviar(to, plantillaCambioContrasena(nombre, `${texto} hs`), 'aviso de cambio de contraseña');
  }

  async sendDonationStatusChange(to: string, nombre: string, donacionId: number, estado: string, url?: string, estadoTurno?: string | null): Promise<boolean> {
    return this.enviar(to, plantillaEstadoDonacion(nombre, donacionId, estado, url, estadoTurno), 'cambio de estado de la donación');
  }

  private async enviar(to: string, contenido: { subject: string; html: string; text: string }, que: string): Promise<boolean> {
    try {
      await this.provider.send({ to, ...contenido });
      return true;
    } catch (error) {
      this.logger.error(`No se pudo enviar el email (${que}): ${error instanceof Error ? error.message : 'error desconocido'}`);
      return false;
    }
  }
}
