import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { HistorialKmVehiculo } from '../historial-km-vehiculo/historial-km-vehiculo.entity';

// Las transiciones solo van hacia adelante: Pendiente -> En proceso -> Finalizada
export const ESTADO_HOJA_PENDIENTE = 'Pendiente';
export const ESTADO_HOJA_EN_PROCESO = 'En proceso';
export const ESTADO_HOJA_FINALIZADA = 'Finalizada';
export const ESTADOS_HOJA_RUTA = [ESTADO_HOJA_PENDIENTE, ESTADO_HOJA_EN_PROCESO, ESTADO_HOJA_FINALIZADA] as const;

@Entity('hoja_ruta')
@Unique('UQ_hoja_ruta_transportista_fecha', ['empleadoTransportistaId', 'fecha'])
export class HojaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_transportista_id' })
  empleadoTransportistaId: number;

  @Column({ name: 'vehiculo_id' })
  vehiculoId: number;

  @Column({ type: 'date' })
  fecha: string;

  // Se completa al pasar a "En proceso" (registro con el km_inicial)
  @Column({ name: 'historial_km_id', type: 'int', nullable: true })
  historialKmId: number | null;

  @Column({
    name: 'km_estimados',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) },
  })
  kmEstimados: number | null;

  @Column({ name: 'cantidad_pedidos', type: 'int', default: 0 })
  cantidadPedidos: number;

  @Column({ length: 20, default: ESTADO_HOJA_PENDIENTE })
  estado: string;

  // Momento en que pasó a "En proceso"
  @Column({ name: 'fecha_inicio', type: 'datetime', nullable: true })
  fechaInicio: Date | null;

  // Momento en que pasó a "Finalizada"
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
