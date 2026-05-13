import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Empleado } from '../empleados/empleado.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Entity('empleado_transportista')
export class EmpleadoTransportista {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_id' })
  empleadoId: number;

  @Column({ name: 'vehiculo_id', nullable: true })
  vehiculoId: number;

  @Column({ name: 'tiene_asignacion', type: 'tinyint', default: 0 })
  tieneAsignacion: boolean;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;
}
