import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MedioAlmacenamiento } from '../medio-almacenamiento/medio-almacenamiento.entity';
import { Empleado } from '../empleados/empleado.entity';
import { MetodoDestruccion } from '../metodo-destruccion/metodo-destruccion.entity';
import { EstadoProcesoDestruccion } from '../estado-proceso-destruccion/estado-proceso-destruccion.entity';

@Entity('proceso_destruccion')
export class ProcesoDestruccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'medio_almacenamiento_id' })
  medioAlmacenamientoId: number;

  @Column({ type: 'date', nullable: true })
  fecha: Date;

  @Column({ name: 'metodo_destruccion_id', nullable: true })
  metodoDestruccionId: number;

  @Column({ name: 'estado_id', default: 1 })
  estadoId: number;

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

  @ManyToOne(() => MetodoDestruccion)
  @JoinColumn({ name: 'metodo_destruccion_id' })
  metodoDestruccion: MetodoDestruccion;

  @ManyToOne(() => EstadoProcesoDestruccion)
  @JoinColumn({ name: 'estado_id' })
  estado: EstadoProcesoDestruccion;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;
}
