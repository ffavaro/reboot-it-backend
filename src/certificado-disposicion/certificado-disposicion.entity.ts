import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lote } from '../lote/lote.entity';
import { GestorAmbiental } from '../gestor-ambiental/gestor-ambiental.entity';

@Entity('certificado_disposicion')
export class CertificadoDisposicion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lote_id' })
  loteId: number;

  @Column({ name: 'gestor_certificado_id' })
  gestorCertificadoId: number;

  @Column({ name: 'fecha_emision', type: 'date', nullable: true })
  fechaEmision: Date;

  @Column({ name: 'numero_certificado', length: 100, nullable: true })
  numeroCertificado: string;

  @Column({ name: 'terminos_cod', length: 500, nullable: true })
  terminosCod: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => GestorAmbiental)
  @JoinColumn({ name: 'gestor_certificado_id' })
  gestorCertificado: GestorAmbiental;
}
