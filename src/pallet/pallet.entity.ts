import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rack } from '../rack/rack.entity';
import { Lote } from '../lote/lote.entity';

@Entity('pallet')
export class Pallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rack_id' })
  rackId: number;

  @Column({ name: 'lote_id', nullable: true })
  loteId: number;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @Column({ name: 'peso_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso_kg: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Rack)
  @JoinColumn({ name: 'rack_id' })
  rack: Rack;

  @ManyToOne(() => Lote, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;
}
