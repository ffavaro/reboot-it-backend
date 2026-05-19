import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Clasificacion } from '../clasificacion/clasificacion.entity';
import { TurnoDetalle } from '../turno-detalle/turno-detalle.entity';
import { TipoMaterial } from '../tipo-material/tipo-material.entity';
import { CondicionMaterial } from '../condicion-material/condicion-material.entity';

@Entity('item_clasificado')
export class ItemClasificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clasificacion_id' })
  clasificacionId: number;

  @Column({ name: 'turno_detalle_id', nullable: true })
  turnoDetalleId: number | null;

  @Column({ name: 'tipo_material_id' })
  tipoMaterialId: number;

  @Column({ name: 'condicion_material_id' })
  condicionMaterialId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @Column({ type: 'int', nullable: true })
  cantidad: number | null;

  @Column({ name: 'peso_kg', type: 'decimal', precision: 8, scale: 3, nullable: true })
  pesoKg: number | null;

  @Column({ name: 'numero_serie', type: 'varchar', length: 100, nullable: true })
  numeroSerie: string | null;

  @Column({ name: 'requiere_destruccion', type: 'tinyint', default: 0 })
  requiereDestruccion: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones: string | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Clasificacion, (c) => c.items)
  @JoinColumn({ name: 'clasificacion_id' })
  clasificacion: Clasificacion;

  @ManyToOne(() => TurnoDetalle, { nullable: true })
  @JoinColumn({ name: 'turno_detalle_id' })
  turnoDetalle: TurnoDetalle;

  @ManyToOne(() => TipoMaterial)
  @JoinColumn({ name: 'tipo_material_id' })
  tipoMaterial: TipoMaterial;

  @ManyToOne(() => CondicionMaterial)
  @JoinColumn({ name: 'condicion_material_id' })
  condicionMaterial: CondicionMaterial;
}
