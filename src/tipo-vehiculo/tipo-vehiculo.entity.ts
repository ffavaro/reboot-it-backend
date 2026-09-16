import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tipo_vehiculo')
export class TipoVehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  descripcion: string;

  @Column({ name: 'peso_minimo', type: 'decimal', precision: 4, scale: 2, nullable: true })
  pesoMinimo: number;

  @Column({ name: 'peso_maximo', type: 'decimal', precision: 5, scale: 2, nullable: true })
  pesoMaximo: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
