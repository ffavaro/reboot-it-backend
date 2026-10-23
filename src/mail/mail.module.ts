import { Module } from '@nestjs/common';
import { MailProvider } from './mail-provider';
import { MailService } from './mail.service';
import { ResendMailProvider } from './resend-mail.provider';

// Para cambiar de proveedor (Brevo, SMTP, etc.): crear otra clase que extienda MailProvider y reemplazarla en useClass.
@Module({
  providers: [{ provide: MailProvider, useClass: ResendMailProvider }, MailService],
  exports: [MailService],
})
export class MailModule {}
