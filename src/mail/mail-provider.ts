export interface MensajeMail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Proveedor de envío de emails. El resto del sistema (MailService) depende de esta clase abstracta:
 * para cambiar de proveedor (Brevo, SMTP, etc.) alcanza con una nueva implementación registrada en MailModule.
 * Si el envío falla, send() lanza un Error.
 */
export abstract class MailProvider {
  abstract send(mensaje: MensajeMail): Promise<void>;
}
