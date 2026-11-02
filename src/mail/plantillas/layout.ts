export const FIRMA = 'Reboot IT – MSIT';

export function escapar(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function parrafo(contenido: string, estilo = ''): string {
  return `<p style="margin:0 0 12px;${estilo}">${contenido}</p>`;
}

export function textoPlano(lineas: string[]): string {
  return [...lineas, FIRMA].join('\n\n');
}

export function layout(titulo: string, cuerpo: string): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0f172a;color:#ffffff;padding:16px 24px;font-size:18px;font-weight:bold;">${FIRMA}</td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:20px;">${titulo}</h1>
          ${cuerpo}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#fafafa;color:#71717a;font-size:12px;">Este es un mensaje automático de ${FIRMA}. No respondas a este email.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
