import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { HojaRuta } from './hoja-ruta.entity';
import { Turno } from '../turno/turno.entity';

/**
 * Tabla `hoja_ruta_turno`: los turnos (pedidos pendientes de retiro) que quedaron incluidos en una hoja de ruta
 * al generarla. Sirve para que la hoja siga mostrando todas sus paradas aunque algunas ya se hayan retirado.
 * Si se cambia algo acá hay que cambiarlo igual en la tabla (la base corre con synchronize: true).
 */
@Entity('hoja_ruta_turno')
@Unique('uq_hoja_ruta_turno', ['hojaRutaId', 'turnoId'])
export class HojaRutaTurno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'hoja_ruta_id', type: 'int' })
  hojaRutaId: number;

  @Column({ name: 'turno_id', type: 'int' })
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
