import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Entity('retiro')
export class Retiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donacion_id' })
  donacionId: number;

  @Column({ name: 'empleado_transportista_id' })
  empleadoTransportistaId: number;

  @Column({ name: 'vehiculo_id' })
  vehiculoId: number;

  @Column({ name: 'fecha_inicio', type: 'datetime' })
  fechaInicio: Date;

  @Column({ name: 'fecha_estimacion', type: 'datetime', nullable: true })
  fechaEstimacion: Date;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Donacion)
  @JoinColumn({ name: 'donacion_id' })
  donacion: Donacion;

  @ManyToOne(() => EmpleadoTransportista)
  @JoinColumn({ name: 'empleado_transportista_id' })
  empleadoTransportista: EmpleadoTransportista;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;
}
