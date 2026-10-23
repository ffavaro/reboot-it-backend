import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailProvider, MensajeMail } from './mail-provider';

/** Envío con Resend. El remitente sale siempre de MAIL_FROM y la clave de RESEND_API_KEY. */
@Injectable()
export class ResendMailProvider extends MailProvider {
  private cliente: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    super();
  }

  async send({ to, subject, html, text }: MensajeMail): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('MAIL_FROM');
    if (!apiKey || !from) throw new Error('Falta configurar RESEND_API_KEY o MAIL_FROM');
    this.cliente ??= new Resend(apiKey);
    const { error } = await this.cliente.emails.send({ from, to, subject, html, text });
    if (error) throw new Error(`Resend: ${error.name ?? 'error'} (${error.message})`);
  }
}
