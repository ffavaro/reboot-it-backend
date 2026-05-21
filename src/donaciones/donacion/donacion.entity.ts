import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Donante } from '../donantes/donante.entity';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { DonacionDetalle } from '../donacion-detalle/donacion-detalle.entity';

@Entity('donacion')
export class Donacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donante_id' })
  donanteId: number;

  @Column({ name: 'estado_donacion_id', nullable: true })
  estadoDonacionId: number | null;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Donante)
  @JoinColumn({ name: 'donante_id' })
  donante: Donante;

  @ManyToOne(() => EstadoDonacion, { nullable: true })
  @JoinColumn({ name: 'estado_donacion_id' })
  estadoDonacion: EstadoDonacion;

  @OneToMany(() => DonacionDetalle, (detalle) => detalle.donacion)
  detalles: DonacionDetalle[];
}
