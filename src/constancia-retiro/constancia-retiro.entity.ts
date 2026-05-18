import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Retiro } from '../retiro/retiro.entity';
import { Empleado } from '../empleados/empleado.entity';

@Entity('constancia_retiro')
export class ConstanciaRetiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'retiro_id' })
  retiroId: number;

  @Column({ name: 'fecha_emision', type: 'date', nullable: true })
  fechaEmision: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'tecnico_id', nullable: true })
  tecnicoId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Retiro)
  @JoinColumn({ name: 'retiro_id' })
  retiro: Retiro;

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: Empleado;
}
