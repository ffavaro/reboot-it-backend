import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TipoDonante } from '../tipo-donante/tipo-donante.entity';

@Entity('donante')
export class Donante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @Column({ name: 'tipo_donante_id' })
  tipoDonanteId: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'razon_social', length: 150, nullable: true })
  razonSocial: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TipoDonante)
  @JoinColumn({ name: 'tipo_donante_id' })
  tipoDonante: TipoDonante;
}
