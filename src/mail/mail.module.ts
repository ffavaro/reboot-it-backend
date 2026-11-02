import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProvider } from '../interfaces/mail.types';
import { ResendProvider } from './resend.provider';

@Module({
  providers: [{ provide: MailProvider, useClass: ResendProvider }, MailService],
  exports: [MailService],
})
export class MailModule {}
