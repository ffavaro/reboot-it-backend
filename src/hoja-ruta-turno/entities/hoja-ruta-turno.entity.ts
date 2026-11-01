
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('hoja_ruta_turno')
export class HojaRutaTurno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'hoja_ruta_id' })
  hojaRutaId: number;

  @Column({ type: 'int', name: 'turno_id' })
  turnoId: number;

  @Column({
    type: 'datetime',
    precision: 6,
    name: 'created_at',
  })
  createdAt: Date;
}
