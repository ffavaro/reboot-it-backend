import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ClasificarMaterialDto } from './dto/clasificar-material.dto';
import { MedioAlmacenamiento } from '../medio-almacenamiento/medio-almacenamiento.entity';
import { ProcesoDestruccion } from '../proceso-destruccion/proceso-destruccion.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(MedioAlmacenamiento)
    private readonly medioAlmacenamientoRepository: Repository<MedioAlmacenamiento>,
    @InjectRepository(ProcesoDestruccion)
    private readonly procesoDestruccionRepository: Repository<ProcesoDestruccion>,
  ) {}

  create(dto: CreateMaterialDto) {
    const material = this.materialRepository.create(dto);
    return this.materialRepository.save(material);
  }

  findAll() {
    return this.materialRepository.find({
      where: { isActive: true },
      relations: ['lote', 'tipoMaterial', 'condicionMaterial'],
    });
  }

  async findOne(id: number) {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['lote', 'tipoMaterial', 'condicionMaterial'],
    });
    if (!material) throw new NotFoundException(`Material ${id} no encontrado`);
    return material;
  }

  async update(id: number, dto: UpdateMaterialDto) {
    await this.findOne(id);
    await this.materialRepository.update(id, dto);
    return this.findOne(id);
  }

  async clasificarMaterial(id: number, dto: ClasificarMaterialDto) {
    await this.findOne(id);

    const { requiereDestruccion, tipoId, marcaId, modeloId, ...updateData } = dto;
    await this.materialRepository.update(id, updateData);

    if (requiereDestruccion) {
      const medioData = this.medioAlmacenamientoRepository.create();
      medioData.materialId = id;
      if (tipoId)   medioData.tipoId   = tipoId;
      if (marcaId)  medioData.marcaId  = marcaId;
      if (modeloId) medioData.modeloId = modeloId;
      const medio = await this.medioAlmacenamientoRepository.save(medioData);

      const procesoData = this.procesoDestruccionRepository.create();
      procesoData.medioAlmacenamientoId = medio.id;
      procesoData.fecha = new Date();
      procesoData.estadoId = 1; // Asignar estado inicial (ej. "Pendiente")
      await this.procesoDestruccionRepository.save(procesoData);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.materialRepository.update(id, { isActive: false });
    return { message: 'Material desactivado' };
  }
}
