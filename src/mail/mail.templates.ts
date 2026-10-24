// Plantillas de los emails: HTML simple con estilos en línea (los clientes de correo no cargan CSS externo) y texto plano.

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function marco(titulo: string, cuerpo: string): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0f172a;color:#ffffff;padding:16px 24px;font-size:18px;font-weight:bold;">Reboot IT – MSIT</td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:20px;">${titulo}</h1>
          ${cuerpo}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#fafafa;color:#71717a;font-size:12px;">Este es un mensaje automático de Reboot IT – MSIT. No respondas a este email.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function plantillaCodigo(nombre: string, code: string, minutosValidez: number) {
  const html = marco(
    'Restablecer tu contraseña',
    `<p style="margin:0 0 12px;">Hola ${escapar(nombre)},</p>
     <p style="margin:0 0 12px;">Usá este código para restablecer tu contraseña:</p>
     <p style="margin:16px 0;text-align:center;font-size:34px;font-weight:bold;letter-spacing:8px;font-family:'Courier New',monospace;color:#0f172a;">${code}</p>
     <p style="margin:0 0 12px;">El código es válido por <strong>${minutosValidez} minutos</strong>.</p>
     <p style="margin:0;color:#52525b;font-size:14px;">Si no lo solicitaste, ignorá este email: tu contraseña no cambia.</p>`,
  );
  const text = `Hola ${nombre},

Usá este código para restablecer tu contraseña: ${code}

El código es válido por ${minutosValidez} minutos.

Si no lo solicitaste, ignorá este email: tu contraseña no cambia.

Reboot IT – MSIT`;
  return { subject: 'Tu código para restablecer la contraseña – Reboot IT', html, text };
}

export function plantillaCambioContrasena(nombre: string, fecha: string) {
  const html = marco(
    'Tu contraseña fue modificada',
    `<p style="margin:0 0 12px;">Hola ${escapar(nombre)},</p>
     <p style="margin:0 0 12px;">Te avisamos que la contraseña de tu cuenta se modificó el <strong>${escapar(fecha)}</strong>.</p>
     <p style="margin:0;color:#b91c1c;font-size:14px;"><strong>Si no fuiste vos, contactá a MSIT inmediatamente.</strong></p>`,
  );
  const text = `Hola ${nombre},

Te avisamos que la contraseña de tu cuenta se modificó el ${fecha}.

Si no fuiste vos, contactá a MSIT inmediatamente.

Reboot IT – MSIT`;
  return { subject: 'Tu contraseña fue modificada – Reboot IT', html, text };
}

// Qué le contamos al donante en cada estado de su donación (por nombre del estado)
function mensajeDeEstado(estado: string): string {
  const e = estado.toLowerCase();
  if (e.includes('certificado')) return 'Recibimos y procesamos tus equipos. Estamos preparando tu certificado de disposición final.';
  if (e.includes('finaliz')) return 'Tu donación finalizó. Ya podés descargar tu certificado de disposición desde Reboot IT. ¡Gracias por sumarte al reciclaje tecnológico!';
  if (e.includes('cancel')) return 'Tu donación fue cancelada. Si fue un error, podés registrar una nueva desde Reboot IT.';
  if (e.includes('proceso')) return 'Tu donación ya está en proceso: nuestro equipo está gestionando el retiro o la recepción de tus equipos.';
  if (e.includes('pendiente')) return 'Registramos tu donación y está pendiente de gestión.';
  return `El estado de tu donación cambió a "${estado}".`;
}

export function plantillaEstadoDonacion(nombre: string, donacionId: number, estado: string, url?: string) {
  const mensaje = mensajeDeEstado(estado);
  const boton = url
    ? `<p style="margin:20px 0 0;"><a href="${escapar(url)}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold;">Ver mis donaciones</a></p>`
    : '';
  const html = marco(
    `Tu donación #${donacionId} cambió de estado`,
    `<p style="margin:0 0 12px;">Hola ${escapar(nombre)},</p>
     <p style="margin:0 0 12px;">El nuevo estado de tu donación es:</p>
     <p style="margin:12px 0;text-align:center;font-size:20px;font-weight:bold;color:#0f172a;">${escapar(estado)}</p>
     <p style="margin:0;">${escapar(mensaje)}</p>
     ${boton}`,
  );
  const text = `Hola ${nombre},

El nuevo estado de tu donación #${donacionId} es: ${estado}.

${mensaje}${url ? `\n\nVer mis donaciones: ${url}` : ''}

Reboot IT – MSIT`;
  return { subject: `Tu donación #${donacionId} cambió de estado – Reboot IT`, html, text };
}
