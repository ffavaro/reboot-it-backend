import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lote } from '../lote/lote.entity';
import { TipoMaterial } from '../tipo-material/tipo-material.entity';
import { CondicionMaterial } from '../condicion-material/condicion-material.entity';

@Entity('material')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lote_id' })
  loteId: number;

  @Column({ name: 'tipo_material_id' })
  tipoMaterialId: number;

  @Column({ name: 'condicion_material_id' })
  condicionMaterialId: number;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => TipoMaterial)
  @JoinColumn({ name: 'tipo_material_id' })
  tipoMaterial: TipoMaterial;

  @ManyToOne(() => CondicionMaterial)
  @JoinColumn({ name: 'condicion_material_id' })
  condicionMaterial: CondicionMaterial;
}
