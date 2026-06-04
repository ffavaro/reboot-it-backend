import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lote } from '../lote/lote.entity';
import { Turno } from '../turno/turno.entity';

@Entity('registro_fotografico')
export class RegistroFotografico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lote_id', nullable: true })
  loteId: number | null;

  @Column({ name: 'turno_id', nullable: true })
  turnoId: number | null;

  @Column({ name: 'url_imagen', length: 500 })
  urlImagen: string;

  @Column({ type: 'date', nullable: true })
  fecha: Date;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lote, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote | null;

  @ManyToOne(() => Turno, { nullable: true })
  @JoinColumn({ name: 'turno_id' })
  turno: Turno | null;
}
