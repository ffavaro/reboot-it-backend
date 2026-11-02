import { Injectable, Logger } from '@nestjs/common';
import { ContenidoMail, MailProvider } from '../interfaces/mail.types';
import { codigoRecuperacion, contrasenaModificada } from './plantillas/contrasena.plantilla';
import { cambioEstadoDonacion, DatosEstadoDonacion } from './plantillas/donacion.plantilla';
import { FORMATO_FECHA } from '../utils/helpers';


@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly provider: MailProvider) {}

  enviarCodigoRecuperacion(to: string, nombre: string, codigo: string, minutos: number): Promise<boolean> {
    return this.enviar(to, codigoRecuperacion(nombre, codigo, minutos), 'codigo de recuperacion');
  }

  enviarAvisoCambioContrasena(to: string, nombre: string, fecha: Date): Promise<boolean> {
    const fechaTexto = `${FORMATO_FECHA.format(fecha)} hs`;
    return this.enviar(to, contrasenaModificada(nombre, fechaTexto), 'cambio de contraseña');
  }

  enviarCambioEstadoDonacion(to: string, datos: DatosEstadoDonacion): Promise<boolean> {
    return this.enviar(to, cambioEstadoDonacion(datos), 'estado de donacion');
  }

  private async enviar(to: string, contenido: ContenidoMail, motivo: string): Promise<boolean> {
    try {
      await this.provider.send({ to, ...contenido });
      return true;
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'error desconocido';
      this.logger.error(`Fallo el envio de mail (${motivo}): ${detalle}`);
      return false;
    }
  }
}
