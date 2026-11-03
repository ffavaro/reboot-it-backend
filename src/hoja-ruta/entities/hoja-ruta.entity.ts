import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { decimalANumero } from '../../utils/helpers';
import { EmpleadoTransportista } from '../../empleado-transportista/empleado-transportista.entity';
import { HistorialKmVehiculo } from '../../historial-km-vehiculo/entities/historial-km-vehiculo.entity';
import { Vehiculo } from '../../vehiculos/vehiculo.entity';
import { ESTADO_HOJA } from '../../utils/helpers';

@Entity('hoja_ruta')
@Unique('UQ_hoja_ruta_transportista_fecha', [
  'empleadoTransportistaId',
  'fecha',
])
export class HojaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_transportista_id' })
  empleadoTransportistaId: number;

  @Column({ name: 'vehiculo_id' })
  vehiculoId: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ name: 'historial_km_id', type: 'int', nullable: true })
  historialKmId: number | null;

  @Column({
    name: 'km_estimados',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalANumero,
  })
  kmEstimados: number | null;

  @Column({ name: 'cantidad_pedidos', type: 'int', default: 0 })
  cantidadPedidos: number;

  @Column({ length: 20, default: ESTADO_HOJA.PENDIENTE })
  estado: string;

  @Column({ name: 'fecha_inicio', type: 'datetime', nullable: true })
  fechaInicio: Date | null;

  @Column({ name: 'fecha_fin', type: 'datetime', nullable: true })
  fechaFin: Date | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => EmpleadoTransportista)
  @JoinColumn({ name: 'empleado_transportista_id' })
  empleadoTransportista: EmpleadoTransportista;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;

  @ManyToOne(() => HistorialKmVehiculo, { nullable: true })
  @JoinColumn({ name: 'historial_km_id' })
  historialKm: HistorialKmVehiculo | null;
}
