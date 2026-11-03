import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from '../../vehiculos/vehiculo.entity';

@Entity('historial_km_vehiculo')
export class HistorialKmVehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'km_inicial' })
  kmInicial: number;

  @Column({ type: 'int', name: 'km_final', nullable: true })
  kmFinal: number | null;

  @Column({ type: 'datetime', precision: 6, name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'km_estimado',
    nullable: true,
  })
  kmEstimado: number | null;

  @Column({ type: 'int', name: 'vehiculo_id' })
  vehiculoId: number;

  @Column({ type: 'int', name: 'hoja_ruta_id', nullable: true })
  hojaRutaId: number | null;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;
}
