import { NotFoundException } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { CrudServiceOption, DatosUpdate, EntidadCrud } from './crud.interface';

export abstract class CrudService<
  T extends EntidadCrud,
  C = DeepPartial<T>,
  U = DeepPartial<T>,
> {
  protected constructor(
    protected readonly repo: Repository<T>,
    protected readonly opt: CrudServiceOption<T>,
  ) {}

  private get sufijo() {
    return this.opt.genero === 'f' ? 'a' : 'o';
  }

  create(dto: C) {
    return this.repo.save(this.repo.create(dto as DeepPartial<T>));
  }

  findAll(alcance: FindOptionsWhere<T> = {}) {
    return this.repo.find({
      where: { isActive: true, ...alcance } as unknown as FindOptionsWhere<T>,
      relations: this.opt.relations,
      order: this.opt.order,
    });
  }

  async findOne(id: number) {
    const entidad = await this.repo.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations: this.opt.relationsOne ?? this.opt.relations,
    });
    if (!entidad) {
      throw new NotFoundException(`${this.opt.etiqueta} ${id} no encontrad${this.sufijo}`);
    }
    return entidad;
  }

  async update(id: number, dto: U) {
    await this.findOne(id);
    await this.repo.update(id, dto as unknown as DatosUpdate<T>);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false } as unknown as DatosUpdate<T>);
    return { message: `${this.opt.etiqueta} desactivad${this.sufijo}` };
  }
}
