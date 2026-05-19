import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Donacion } from '../donacion/donacion.entity';
import { TipoMaterial } from '../tipo-material/tipo-material.entity';

@Entity('donacion_detalle')
export class DonacionDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donacion_id' })
  donacionId: number;

  @Column({ name: 'tipo_material_id' })
  tipoMaterialId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @Column({ name: 'cantidad_estimada', type: 'int', nullable: true })
  cantidadEstimada: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones: string | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Donacion, (donacion) => donacion.detalles)
  @JoinColumn({ name: 'donacion_id' })
  donacion: Donacion;

  @ManyToOne(() => TipoMaterial)
  @JoinColumn({ name: 'tipo_material_id' })
  tipoMaterial: TipoMaterial;
}
