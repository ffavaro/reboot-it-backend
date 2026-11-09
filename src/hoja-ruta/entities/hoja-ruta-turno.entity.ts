import {
  CreateDateColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Turno } from '../../turno/turno.entity';
import { HojaRuta } from './hoja-ruta.entity';

@Entity('hoja_ruta_turno')
@Unique('uq_hoja_ruta_turno', ['hojaRutaId', 'turnoId'])
export class HojaRutaTurno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'hoja_ruta_id', type: 'int', nullable: false })
  hojaRutaId: number;

  @Column({ name: 'turno_id', type: 'int', nullable: false })
  turnoId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => HojaRuta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hoja_ruta_id' })
  hojaRuta: HojaRuta;

  @ManyToOne(() => Turno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;
}
