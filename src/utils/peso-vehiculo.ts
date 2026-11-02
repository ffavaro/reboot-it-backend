import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

const aNumero = (valor: unknown) =>
  valor === null || valor === undefined ? null : Number(valor);

export async function validarPesoDonacionVehiculo(
  manager: EntityManager,
  donacionId?: number | null,
  vehiculoId?: number | null,
): Promise<void> {
  if (!donacionId || !vehiculoId) return;

  const [donacion, vehiculo] = await Promise.all([
    manager.findOne(Donacion, { where: { id: donacionId } }),
    manager.findOne(Vehiculo, {
      where: { id: vehiculoId },
      relations: ['tipoVehiculo'],
    }),
  ]);

  const peso = aNumero(donacion?.pesoEstimadoKg);
  const minimo = aNumero(vehiculo?.tipoVehiculo?.pesoMinimo);
  const maximo = aNumero(vehiculo?.tipoVehiculo?.pesoMaximo);
  if (peso === null || minimo === null || maximo === null) return;

  if (peso < minimo || peso > maximo) {
    throw new BadRequestException(
      `El vehículo ${vehiculo!.patente} soporta entre ${minimo} y ${maximo} kg, y la donación tiene un peso estimado de ${peso} kg. Elegí otro transportista o vehículo.`,
    );
  }
}
