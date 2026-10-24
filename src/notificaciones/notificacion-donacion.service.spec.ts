/// <reference types="jest" />
import { NotificacionDonacionService } from './notificacion-donacion.service';
import { plantillaEstadoDonacion } from '../mail/mail.templates';

const donacion = (estadoId: number, estado: string, usuarioId: number | null = 9) => ({
  id: 12,
  estadoDonacionId: estadoId,
  estadoDonacion: { descripcion: estado },
  donante: { nombre: 'Ana', usuarioId },
});

function armar(d: unknown, usuario: unknown = { id: 9, email: 'ana@test.com', nombre: 'Ana', isActive: true }) {
  const donaciones = { findOne: jest.fn().mockResolvedValue(d) };
  const usuarios = { findOne: jest.fn().mockResolvedValue(usuario) };
  const turnos = { findOne: jest.fn().mockResolvedValue({ estadoTurno: { descripcion: 'Asignado' } }) };
  const mail = { sendDonationStatusChange: jest.fn().mockResolvedValue(true) };
  const config = { get: jest.fn((k: string) => (k === 'FRONTEND_URL' ? 'http://localhost:3000/' : undefined)) };
  const service = new NotificacionDonacionService(donaciones as never, usuarios as never, turnos as never, mail as never, config as never);
  return { service, mail, donaciones, turnos };
}

describe('NotificacionDonacionService', () => {
  it('avisa al donante cuando el estado cambió', async () => {
    const { service, mail } = armar(donacion(2, 'En proceso'));
    await service.estadoCambiado(12, 1);
    expect(mail.sendDonationStatusChange).toHaveBeenCalledWith('ana@test.com', 'Ana', 12, 'En proceso', 'http://localhost:3000/pages/donacion', 'Asignado');
  });

  it('no envía nada si el estado es el mismo', async () => {
    const { service, mail } = armar(donacion(2, 'En proceso'));
    await service.estadoCambiado(12, 2);
    expect(mail.sendDonationStatusChange).not.toHaveBeenCalled();
  });

  it('no envía si el donante no tiene usuario', async () => {
    const { service, mail } = armar(donacion(2, 'En proceso', null));
    await service.estadoCambiado(12, 1);
    expect(mail.sendDonationStatusChange).not.toHaveBeenCalled();
  });

  it('no envía si el usuario está desactivado', async () => {
    const { service, mail } = armar(donacion(2, 'En proceso'), { id: 9, email: 'ana@test.com', nombre: 'Ana', isActive: false });
    await service.estadoCambiado(12, 1);
    expect(mail.sendDonationStatusChange).not.toHaveBeenCalled();
  });

  it('un error de la base o del email no se propaga', async () => {
    const { service, mail, donaciones } = armar(donacion(2, 'En proceso'));
    mail.sendDonationStatusChange.mockRejectedValue(new Error('falla'));
    await expect(service.estadoCambiado(12, 1)).resolves.toBeUndefined();
    donaciones.findOne.mockRejectedValue(new Error('base caída'));
    await expect(service.estadoCambiado(12, 1)).resolves.toBeUndefined();
    await expect(service.estadoActual(12)).resolves.toBeNull();
  });

  it('la plantilla trae el estado, un mensaje acorde, el estado del turno y el enlace', () => {
    const { subject, html, text } = plantillaEstadoDonacion('Ana <b>', 12, 'Finalizada', 'http://x/pages/donacion', 'Finalizado');
    expect(html).toContain('Estado de tu turno');
    expect(text).toContain('Estado de tu turno: Finalizado');
    expect(subject).toContain('#12');
    expect(html).toContain('Finalizada');
    expect(html).toContain('certificado de disposición');
    expect(html).toContain('Ana &lt;b&gt;');
    expect(text).toContain('http://x/pages/donacion');
  });
});
