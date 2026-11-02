import { ContenidoMail } from '../mail.types';
import { escapar, layout, parrafo, textoPlano } from './layout';

export interface DatosEstadoDonacion {
  nombre: string;
  donacionId: number;
  estado: string;
  estadoTurno?: string | null;
  url?: string;
}

const MENSAJES_POR_ESTADO: Array<[string, string]> = [
  ['certificado', 'Recibimos y procesamos tus equipos. Estamos preparando tu certificado de disposición final.'],
  ['finaliz', 'Tu donación finalizó. Ya podés descargar tu certificado de disposición desde Reboot IT. ¡Gracias por sumarte al reciclaje tecnológico!'],
  ['cancel', 'Tu donación fue cancelada. Si fue un error, podés registrar una nueva desde Reboot IT.'],
  ['proceso', 'Tu donación ya está en proceso: nuestro equipo está gestionando el retiro o la recepción de tus equipos.'],
  ['pendiente', 'Registramos tu donación y está pendiente de gestión.'],
];

export function mensajeSegunEstado(estado: string): string {
  const clave = estado.toLowerCase();
  const encontrado = MENSAJES_POR_ESTADO.find(([fragmento]) => clave.includes(fragmento));
  return encontrado ? encontrado[1] : `El estado de tu donación cambió a "${estado}".`;
}

export function cambioEstadoDonacion(datos: DatosEstadoDonacion): ContenidoMail {
  const { nombre, donacionId, estado, estadoTurno, url } = datos;
  const mensaje = mensajeSegunEstado(estado);

  const bloques = [
    parrafo(`Hola ${escapar(nombre)},`),
    parrafo('El nuevo estado de tu donación es:'),
    `<p style="margin:12px 0;text-align:center;font-size:20px;font-weight:bold;color:#0f172a;">${escapar(estado)}</p>`,
    parrafo(escapar(mensaje), 'margin:0;'),
  ];

  if (estadoTurno) {
    bloques.push(
      `<p style="margin:16px 0 0;padding:10px 12px;background:#f4f4f5;border-radius:6px;">Estado de tu turno: <strong>${escapar(estadoTurno)}</strong></p>`,
    );
  }

  if (url) {
    bloques.push(
      `<p style="margin:20px 0 0;"><a href="${escapar(url)}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold;">Ver mis donaciones</a></p>`,
    );
  }

  const lineas = [`Hola ${nombre},`, `El nuevo estado de tu donación #${donacionId} es: ${estado}.`, mensaje];
  if (estadoTurno) lineas.push(`Estado de tu turno: ${estadoTurno}`);
  if (url) lineas.push(`Ver mis donaciones: ${url}`);

  return {
    subject: `Tu donación #${donacionId} cambió de estado – Reboot IT`,
    html: layout(`Tu donación #${donacionId} cambió de estado`, bloques.join('\n')),
    text: textoPlano(lineas),
  };
}
