import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rack } from '../rack/rack.entity';
import { MedioAlmacenamiento } from '../medio-almacenamiento/medio-almacenamiento.entity';

@Entity('pallet')
export class Pallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rack_id' })
  rackId: number;

  @Column({ name: 'mdc_id', nullable: true })
  mdcId: number;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @Column({ name: 'status_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  statusKg: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Rack)
  @JoinColumn({ name: 'rack_id' })
  rack: Rack;

  @ManyToOne(() => MedioAlmacenamiento)
  @JoinColumn({ name: 'mdc_id' })
  medioAlmacenamiento: MedioAlmacenamiento;
}
