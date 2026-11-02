import { ContenidoMail } from '../mail.types';
import { escapar, layout, parrafo, textoPlano } from './layout';

export function codigoRecuperacion(nombre: string, codigo: string, minutos: number): ContenidoMail {
  const html = layout(
    'Restablecer tu contraseña',
    [
      parrafo(`Hola ${escapar(nombre)},`),
      parrafo('Usá este código para restablecer tu contraseña:'),
      `<p style="margin:16px 0;text-align:center;font-size:34px;font-weight:bold;letter-spacing:8px;font-family:'Courier New',monospace;color:#0f172a;">${escapar(codigo)}</p>`,
      parrafo(`El código es válido por <strong>${minutos} minutos</strong>.`),
      parrafo('Si no lo solicitaste, ignorá este email: tu contraseña no cambia.', 'margin:0;color:#52525b;font-size:14px;'),
    ].join('\n'),
  );

  const text = textoPlano([
    `Hola ${nombre},`,
    `Usá este código para restablecer tu contraseña: ${codigo}`,
    `El código es válido por ${minutos} minutos.`,
    'Si no lo solicitaste, ignorá este email: tu contraseña no cambia.',
  ]);

  return { subject: 'Tu código para restablecer la contraseña – Reboot IT', html, text };
}

export function contrasenaModificada(nombre: string, fecha: string): ContenidoMail {
  const html = layout(
    'Tu contraseña fue modificada',
    [
      parrafo(`Hola ${escapar(nombre)},`),
      parrafo(`Te avisamos que la contraseña de tu cuenta se modificó el <strong>${escapar(fecha)}</strong>.`),
      parrafo('<strong>Si no fuiste vos, contactá a MSIT inmediatamente.</strong>', 'margin:0;color:#b91c1c;font-size:14px;'),
    ].join('\n'),
  );

  const text = textoPlano([
    `Hola ${nombre},`,
    `Te avisamos que la contraseña de tu cuenta se modificó el ${fecha}.`,
    'Si no fuiste vos, contactá a MSIT inmediatamente.',
  ]);

  return { subject: 'Tu contraseña fue modificada – Reboot IT', html, text };
}
