import { NotFoundException } from '@nestjs/common';
import { EntityManager, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';

export function buscarActivo<T extends ObjectLiteral>(manager: EntityManager, entidad: EntityTarget<T>, where: FindOptionsWhere<T>) {
  return manager.findOne(entidad, { where: { ...where, isActive: true } as FindOptionsWhere<T> });
}

export async function exigirActivo<T extends ObjectLiteral>(
  manager: EntityManager,
  entidad: EntityTarget<T>,
  where: FindOptionsWhere<T>,
  mensaje: string,
) {
  const fila = await buscarActivo(manager, entidad, where);
  if (!fila) throw new NotFoundException(mensaje);
  return fila;
}
