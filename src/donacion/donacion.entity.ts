import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Donante } from '../donantes/donante.entity';

@Entity('donacion')
export class Donacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donante_id' })
  donanteId: number;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  estado: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Donante)
  @JoinColumn({ name: 'donante_id' })
  donante: Donante;
}
