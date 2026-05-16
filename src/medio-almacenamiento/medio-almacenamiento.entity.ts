import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Material } from '../material/material.entity';
import { Tipo } from '../tipo/tipo.entity';
import { Marca } from '../marca/marca.entity';
import { Modelo } from '../modelo/modelo.entity';

@Entity('medio_almacenamiento')
export class MedioAlmacenamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @Column({ name: 'tipo_id', nullable: true })
  tipoId: number;

  @Column({ name: 'marca_id', nullable: true })
  marcaId: number;

  @Column({ name: 'modelo_id', nullable: true })
  modeloId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @ManyToOne(() => Tipo, { nullable: true })
  @JoinColumn({ name: 'tipo_id' })
  tipo: Tipo;

  @ManyToOne(() => Marca, { nullable: true })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca;

  @ManyToOne(() => Modelo, { nullable: true })
  @JoinColumn({ name: 'modelo_id' })
  modelo: Modelo;
}
