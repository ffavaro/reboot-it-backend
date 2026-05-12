import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Material } from '../material/material.entity';

@Entity('medio_almacenamiento')
export class MedioAlmacenamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @Column({ length: 50, nullable: true })
  tipo: string;

  @Column({ length: 100, nullable: true })
  marca: string;

  @Column({ length: 100, nullable: true })
  modelo: string;

  @Column({ name: 'terminos_uso', length: 500, nullable: true })
  terminosUso: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
