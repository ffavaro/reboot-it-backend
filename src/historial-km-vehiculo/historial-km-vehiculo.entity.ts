import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Entity('historial_km_vehiculo')
export class HistorialKmVehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_vehiculo' })
  vehiculoId: number;

  @Column({ name: 'km_inicial', type: 'int', unsigned: true })
  kmInicial: number;

  // Se completa al finalizar el recorrido (hoja de ruta)
  @Column({ name: 'km_final', type: 'int', unsigned: true, nullable: true })
  kmFinal: number | null;

  // Distancia estimada del recorrido (Google Maps) de la hoja de ruta que generó este registro; nula en los registros anteriores
  @Column({
    name: 'km_estimado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) },
  })
  kmEstimado: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}
