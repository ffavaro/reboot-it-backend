
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('hoja_ruta')
export class HojaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'empleado_transportista_id' })
  empleadoTransportistaId: number;

  @Column({ type: 'int', name: 'vehiculo_id' })
  vehiculoId: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int', name: 'historial_km_id', nullable: true })
  historialKmId: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'km_estimados',
    nullable: true,
  })
  kmEstimados: number | null;

  @Column({ type: 'int', name: 'cantidad_pedidos' })
  cantidadPedidos: number;

  @Column({ type: 'varchar', length: 20 })
  estado: string;

  @Column({ type: 'datetime', name: 'fecha_inicio', nullable: true })
  fechaInicio: Date | null;

  @Column({ type: 'datetime', name: 'fecha_fin', nullable: true })
  fechaFin: Date | null;

  @Column({ type: 'tinyint', name: 'is_active', default: 1 })
  isActive: boolean;

  @Column({ type: 'datetime', precision: 6, name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', precision: 6, name: 'updated_at' })
  updatedAt: Date;
}
