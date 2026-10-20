import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TipoVehiculo } from '../tipo-vehiculo/tipo-vehiculo.entity';

@Entity('vehiculo')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo_vehiculo_id' })
  tipoVehiculoId: number;

  @Column({ length: 20 })
  patente: string;

  @Column({ length: 50 })
  marca: string;

  @Column({ length: 50 })
  modelo: string;

  @Column({ name: 'itv_vencimiento', type: 'date', nullable: true })
  itvVencimiento: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  kilometraje: number;

  @Column({ name: 'tipo_combustible', length: 30, nullable: true })
  tipoCombustible: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TipoVehiculo)
  @JoinColumn({ name: 'tipo_vehiculo_id' })
  tipoVehiculo: TipoVehiculo;
}
