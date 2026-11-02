export interface ContenidoMail {
  subject: string;
  html: string;
  text: string;
}

export interface MensajeMail extends ContenidoMail {
  to: string;
}

export abstract class MailProvider {
  abstract send(mensaje: MensajeMail): Promise<void>;
}
