import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Marca } from '../marca/marca.entity';
import { Tipo } from '../tipo/tipo.entity';

@Entity('modelo')
@Unique('uq_modelo_nombre_marca_tipo', ['nombre', 'marcaId', 'tipoId'])
export class Modelo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'marca_id' })
  marcaId: number;

  @Column({ name: 'tipo_id' })
  tipoId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Marca)
  @JoinColumn({ name: 'marca_id' })
  marca: Marca;

  @ManyToOne(() => Tipo)
  @JoinColumn({ name: 'tipo_id' })
  tipo: Tipo;
}
