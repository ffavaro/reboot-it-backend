import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailProvider, MensajeMail } from '../interfaces/mail.types';

@Injectable()
export class ResendProvider extends MailProvider {
  private cliente?: Resend;

  constructor(private readonly config: ConfigService) {
    super();
  }

  async send(mensaje: MensajeMail): Promise<void> {
    const from = this.config.get<string>('MAIL_FROM');
    if (!from) {
      throw new Error('Falta configurar MAIL_FROM');
    }

    const { error } = await this.obtenerCliente().emails.send({ from, ...mensaje });
    if (error) {
      throw new Error(`Resend: ${error.name ?? 'error'} (${error.message})`);
    }
  }

  private obtenerCliente(): Resend {
    if (!this.cliente) {
      const apiKey = this.config.get<string>('RESEND_API_KEY');
      if (!apiKey) {
        throw new Error('Falta configurar RESEND_API_KEY');
      }
      this.cliente = new Resend(apiKey);
    }
    return this.cliente;
  }
}
