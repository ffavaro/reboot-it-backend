import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Donante } from './donante.entity';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ROL_ID_DONANTE } from '../auth/auth.decorators';

@Injectable()
export class DonantesService {
  constructor(
    @InjectRepository(Donante)
    private readonly donanteRepository: Repository<Donante>,
    private readonly dataSource: DataSource,
    private readonly usuariosService: UsuariosService,
    private readonly mail: MailService,
  ) {}

  /**
   * Todo donante tiene un usuario. Hay dos formas de crearlo:
   *  - con `usuario` (email, contraseña y CUIT/DNI): se crea el usuario con rol Donante y el donante
   *    queda vinculado a él, en una sola transacción (si algo falla, no queda ninguno de los dos);
   *  - con `usuarioId`: el registro público crea primero el usuario y después el donante.
   */
  async create(dto: CreateDonanteDto) {
    const { usuario, ...datos } = dto;
    if (usuario && datos.usuarioId) {
      throw new BadRequestException('Enviá los datos del usuario a crear o el id de un usuario existente, no ambos');
    }
    if (!usuario && !datos.usuarioId) {
      throw new BadRequestException('El donante necesita un usuario: ingresá su email, contraseña y CUIT/DNI');
    }
    if (!usuario) {
      return this.donanteRepository.save(this.donanteRepository.create(datos));
    }

    return this.dataSource.transaction(async (manager) => {
      const nuevoUsuario = await this.usuariosService.crearEnTransaccion(manager, {
        nombre: datos.nombre,
        cuitDni: usuario.cuitDni,
        email: usuario.email,
        password: usuario.password,
        rolId: ROL_ID_DONANTE,
        isActive: true,
      });
      return manager.save(manager.create(Donante, { ...datos, usuarioId: nuevoUsuario.id }));
    });
  }

  findAll() {
    return this.donanteRepository.find({
      where: { isActive: true },
      relations: ['tipoDonante'],
    });
  }

  async findOne(id: number) {
    const donante = await this.donanteRepository.findOne({
      where: { id },
      relations: ['tipoDonante'],
    });
    if (!donante) throw new NotFoundException(`Donante ${id} no encontrado`);
    return donante;
  }

  async update(id: number, dto: UpdateDonanteDto) {
    await this.findOne(id);
    await this.donanteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.donanteRepository.update(id, { isActive: false });
    return { message: 'Donante desactivado' };
  }

  /**
   * Restablece la contraseña del usuario del donante: genera una temporal (con mayúsculas, minúsculas y números), la guarda
   * hasheada y la devuelve una sola vez para que se la den al donante. Si el usuario tiene email, se le avisa del cambio.
   * La contraseña temporal nunca se guarda en claro ni se registra en la auditoría.
   */
  async restablecerContrasena(id: number) {
    const donante = await this.findOne(id);
    if (!donante.usuarioId) throw new BadRequestException('El donante no tiene un usuario asociado.');
    const usuario = await this.usuariosService.findOne(donante.usuarioId);
    const elegir = (caracteres: string, n: number) => Array.from({ length: n }, () => caracteres[randomInt(0, caracteres.length)]);
    const caracteres = [
      ...elegir('ABCDEFGHJKLMNPQRSTUVWXYZ', 3),
      ...elegir('abcdefghijkmnpqrstuvwxyz', 5),
      ...elegir('23456789', 3),
    ];
    for (let i = caracteres.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
    }
    const password = caracteres.join('');
    await this.usuariosService.updatePassword(usuario.id, await bcrypt.hash(password, 10));
    const avisado = usuario.email ? await this.mail.sendPasswordChangedNotice(usuario.email, donante.nombre || usuario.nombre, new Date()) : false;
    return { password, email: usuario.email ?? null, avisoEnviado: avisado };
  }
}
