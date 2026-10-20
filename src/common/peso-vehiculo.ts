import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

/**
 * Verifica que el vehículo soporte el peso estimado de la donación (entre el peso mínimo y máximo de su tipo).
 * Si falta el peso de la donación o los límites del tipo de vehículo no se puede evaluar y se deja pasar.
 */
export async function validarPesoDonacionVehiculo(
  manager: EntityManager,
  donacionId: number | null | undefined,
  vehiculoId: number | null | undefined,
) {
  if (!donacionId || !vehiculoId) return;
  const [donacion, vehiculo] = await Promise.all([
    manager.getRepository(Donacion).findOne({ where: { id: donacionId } }),
    manager.getRepository(Vehiculo).findOne({ where: { id: vehiculoId }, relations: ['tipoVehiculo'] }),
  ]);
  const tipo = vehiculo?.tipoVehiculo;
  if (!donacion || !tipo || donacion.pesoEstimadoKg == null || tipo.pesoMinimo == null || tipo.pesoMaximo == null) return;
  // las columnas DECIMAL de MySQL llegan como texto
  const peso = Number(donacion.pesoEstimadoKg);
  const minimo = Number(tipo.pesoMinimo);
  const maximo = Number(tipo.pesoMaximo);
  if (peso < minimo || peso > maximo) {
    throw new BadRequestException(
      `El vehículo ${vehiculo.patente} soporta entre ${minimo} y ${maximo} kg, y la donación tiene un peso estimado de ${peso} kg. Elegí otro transportista o vehículo.`,
    );
  }
}
