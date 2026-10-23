/// <reference types="jest" />
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MENSAJE_CODIGO_ENVIADO, MENSAJE_CONTRASENA_ACTUALIZADA, PasswordResetService } from './password-reset.service';
import { PasswordResetCode } from './password-reset-code.entity';
import { Usuario } from '../usuarios/usuario.entity';

const usuario = { id: 7, nombre: 'Ana', email: 'ana@test.com', isActive: true } as Usuario;
const dto = { email: 'ana@test.com', code: '123456', newPassword: 'Clave1234', confirmPassword: 'Clave1234' };

function armar() {
  const usuarios = { findOne: jest.fn() };
  const manager = { update: jest.fn().mockResolvedValue(undefined) };
  const codigos = {
    findOne: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    increment: jest.fn().mockResolvedValue(undefined),
    create: jest.fn((x) => x),
    save: jest.fn().mockResolvedValue(undefined),
    manager: { transaction: jest.fn(async (cb: (m: typeof manager) => Promise<void>) => cb(manager)) },
  };
  const mail = {
    sendPasswordResetCode: jest.fn().mockResolvedValue(true),
    sendPasswordChangedNotice: jest.fn().mockResolvedValue(true),
  };
  const config = { get: jest.fn((k: string) => ({ RESET_CODE_TTL_MINUTES: '15', RESET_CODE_MAX_ATTEMPTS: '5' } as Record<string, string>)[k]) };
  const service = new PasswordResetService(usuarios as never, codigos as never, mail as never, config as never);
  return { service, usuarios, codigos, manager, mail };
}

describe('PasswordResetService', () => {
  describe('forgotPassword', () => {
    it('email inexistente: responde lo mismo y no envía nada', async () => {
      const { service, usuarios, codigos, mail } = armar();
      usuarios.findOne.mockResolvedValue(null);
      await expect(service.forgotPassword('nadie@test.com', '1.1.1.1')).resolves.toEqual({ message: MENSAJE_CODIGO_ENVIADO });
      expect(codigos.save).not.toHaveBeenCalled();
      expect(mail.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('usuario desactivado: responde lo mismo y no envía nada', async () => {
      const { service, usuarios, mail } = armar();
      usuarios.findOne.mockResolvedValue({ ...usuario, isActive: false });
      await expect(service.forgotPassword(usuario.email, null)).resolves.toEqual({ message: MENSAJE_CODIGO_ENVIADO });
      expect(mail.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('email válido: invalida los códigos previos, guarda solo el hash y envía el código de 6 dígitos', async () => {
      const { service, usuarios, codigos, mail } = armar();
      usuarios.findOne.mockResolvedValue(usuario);
      await expect(service.forgotPassword(usuario.email, '1.1.1.1')).resolves.toEqual({ message: MENSAJE_CODIGO_ENVIADO });
      expect(codigos.update).toHaveBeenCalledTimes(1);
      const [, , code, minutos] = mail.sendPasswordResetCode.mock.calls[0];
      expect(code).toMatch(/^\d{6}$/);
      expect(minutos).toBe(15);
      const guardado = codigos.save.mock.calls[0][0];
      expect(guardado.codeHash).not.toContain(code);
      expect(await bcrypt.compare(code, guardado.codeHash)).toBe(true);
      expect(guardado.expiresAt.getTime()).toBeGreaterThan(Date.now() + 14 * 60_000);
    });

    it('si falla el envío del email igual responde lo mismo', async () => {
      const { service, usuarios, mail } = armar();
      usuarios.findOne.mockResolvedValue(usuario);
      mail.sendPasswordResetCode.mockResolvedValue(false);
      await expect(service.forgotPassword(usuario.email, null)).resolves.toEqual({ message: MENSAJE_CODIGO_ENVIADO });
    });
  });

  describe('resetPassword', () => {
    it('código correcto: cambia la contraseña, marca el código como usado y avisa por email', async () => {
      const { service, usuarios, codigos, manager, mail } = armar();
      usuarios.findOne.mockResolvedValue(usuario);
      codigos.findOne.mockResolvedValue({ id: 3, attempts: 1, codeHash: await bcrypt.hash('123456', 4) } as PasswordResetCode);
      await expect(service.resetPassword(dto)).resolves.toEqual({ message: MENSAJE_CONTRASENA_ACTUALIZADA });
      expect(codigos.manager.transaction).toHaveBeenCalledTimes(1);
      const [, id, cambios] = manager.update.mock.calls[0];
      expect(id).toBe(7);
      expect(cambios.password).not.toBe('Clave1234');
      expect(await bcrypt.compare('Clave1234', cambios.password)).toBe(true);
      expect(manager.update.mock.calls[1][2].usedAt).toBeInstanceOf(Date);
      expect(mail.sendPasswordChangedNotice).toHaveBeenCalledTimes(1);
    });

    it('código incorrecto: suma un intento y no cambia nada', async () => {
      const { service, usuarios, codigos, manager, mail } = armar();
      usuarios.findOne.mockResolvedValue(usuario);
      codigos.findOne.mockResolvedValue({ id: 3, attempts: 0, codeHash: await bcrypt.hash('654321', 4) } as PasswordResetCode);
      await expect(service.resetPassword(dto)).rejects.toThrow('El código es inválido o expiró. Solicitá uno nuevo.');
      expect(codigos.increment).toHaveBeenCalledWith({ id: 3 }, 'attempts', 1);
      expect(manager.update).not.toHaveBeenCalled();
      expect(mail.sendPasswordChangedNotice).not.toHaveBeenCalled();
    });

    it('código expirado o ya usado (no hay uno vigente): 400', async () => {
      const { service, usuarios, codigos } = armar();
      usuarios.findOne.mockResolvedValue(usuario);
      codigos.findOne.mockResolvedValue(null);
      await expect(service.resetPassword(dto)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.resetPassword(dto)).rejects.toThrow('El código es inválido o expiró. Solicitá uno nuevo.');
    });

    it('email inexistente: el mismo 400 genérico', async () => {
      const { service, usuarios } = armar();
      usuarios.findOne.mockResolvedValue(null);
      await expect(service.resetPassword(dto)).rejects.toThrow('El código es inválido o expiró. Solicitá uno nuevo.');
    });

    it('intentos superados: invalida el código aunque este sea correcto', async () => {
      const { service, usuarios, codigos, manager } = armar();
      usuarios.findOne.mockResolvedValue(usuario);
      codigos.findOne.mockResolvedValue({ id: 3, attempts: 5, codeHash: await bcrypt.hash('123456', 4) } as PasswordResetCode);
      await expect(service.resetPassword(dto)).rejects.toThrow('Superaste la cantidad de intentos. Solicitá un nuevo código.');
      expect(codigos.update).toHaveBeenCalledWith(3, { usedAt: expect.any(Date) });
      expect(manager.update).not.toHaveBeenCalled();
    });
  });
});
