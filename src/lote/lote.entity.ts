import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';

@Entity('lote')
export class Lote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donacion_id' })
  donacionId: number;

  @Column({ name: 'peso_bruto_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoBrutoKg: number;

  @Column({ length: 500, nullable: true })
  observaciones: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Donacion)
  @JoinColumn({ name: 'donacion_id' })
  donacion: Donacion;
}
