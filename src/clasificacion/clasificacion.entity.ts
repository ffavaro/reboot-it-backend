import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lote } from '../lote/lote.entity';
import { Empleado } from '../empleados/empleado.entity';

@Entity('clasificacion')
export class Clasificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lote_id' })
  loteId: number;

  @Column({ type: 'date', nullable: true })
  fecha: Date;

  @Column({ name: 'inspector_id', nullable: true })
  inspectorId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'inspector_id' })
  inspector: Empleado;
}
