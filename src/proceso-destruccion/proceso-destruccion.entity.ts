import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MedioAlmacenamiento } from '../medio-almacenamiento/medio-almacenamiento.entity';
import { Empleado } from '../empleados/empleado.entity';

@Entity('proceso_destruccion')
export class ProcesoDestruccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'medio_almacenamiento_id' })
  medioAlmacenamientoId: number;

  @Column({ type: 'date', nullable: true })
  fecha: Date;

  @Column({ length: 150, nullable: true })
  metodo: string;

  @Column({ name: 'empleado_id', nullable: true })
  empleadoId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MedioAlmacenamiento)
  @JoinColumn({ name: 'medio_almacenamiento_id' })
  medioAlmacenamiento: MedioAlmacenamiento;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;
}
