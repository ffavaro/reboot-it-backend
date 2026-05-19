import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Turno } from '../turno/turno.entity';
import { DonacionDetalle } from '../donacion-detalle/donacion-detalle.entity';
import { TipoMaterial } from '../tipo-material/tipo-material.entity';

@Entity('turno_detalle')
export class TurnoDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'turno_id' })
  turnoId: number;

  @Column({ name: 'donacion_detalle_id' })
  donacionDetalleId: number;

  @Column({ name: 'tipo_material_id' })
  tipoMaterialId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @Column({ name: 'cantidad_confirmada', type: 'int', nullable: true })
  cantidadConfirmada: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones: string | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Turno, (turno) => turno.detalles)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @ManyToOne(() => DonacionDetalle)
  @JoinColumn({ name: 'donacion_detalle_id' })
  donacionDetalle: DonacionDetalle;

  @ManyToOne(() => TipoMaterial)
  @JoinColumn({ name: 'tipo_material_id' })
  tipoMaterial: TipoMaterial;
}
