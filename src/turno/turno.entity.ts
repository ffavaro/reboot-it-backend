import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Donante } from '../donantes/donante.entity';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';

@Entity('turno')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donante_id' })
  donanteId: number;

  @Column({ name: 'estado_turno_id' })
  estadoTurnoId: number;

  @Column({ name: 'fecha_hora', type: 'datetime' })
  fechaHora: Date;

  @Column({ name: 'observaciones', length: 255, nullable: true })
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

  @ManyToOne(() => EstadoTurno)
  @JoinColumn({ name: 'estado_turno_id' })
  estadoTurno: EstadoTurno;
}
