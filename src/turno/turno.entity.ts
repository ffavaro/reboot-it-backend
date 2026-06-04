import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Donante } from '../donantes/donante.entity';
import { EstadoTurno } from '../estado-turno/estado-turno.entity';
import { TurnoDetalle } from '../turno-detalle/turno-detalle.entity';
import { Empleado } from '../empleados/empleado.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';

@Entity('turno')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donante_id' })
  donanteId: number;

  @Column({ name: 'donacion_id', type: 'int', nullable: true })
  donacionId: number | null;

  @Column({ name: 'estado_turno_id' })
  estadoTurnoId: number;

  @Column({ name: 'fecha_hora', type: 'datetime' })
  fechaHora: Date;

  @Column({ name: 'observaciones', length: 255, nullable: true })
  descripcion: string;

  @Column({ name: 'necesita_retiro', type: 'tinyint', default: 0 })
  necesitaRetiro: boolean;

  @Column({ name: 'empleado_id', nullable: true })
  empleadoId: number | null;

  @Column({ name: 'empleado_transportista_id', nullable: true })
  empleadoTransportistaId: number | null;

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

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado | null;

  @ManyToOne(() => EmpleadoTransportista, { nullable: true })
  @JoinColumn({ name: 'empleado_transportista_id' })
  empleadoTransportista: EmpleadoTransportista | null;

  @OneToMany(() => TurnoDetalle, (detalle) => detalle.turno)
  detalles: TurnoDetalle[];
}
