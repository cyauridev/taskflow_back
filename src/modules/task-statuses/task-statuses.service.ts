import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatus } from './entities/task-status.entity';

@Injectable()
export class TaskStatusesService {
  constructor(
    @InjectRepository(TaskStatus)
    private readonly taskStatusesRepository: Repository<TaskStatus>,
  ) {}

  async create(dto: CreateTaskStatusDto) {
    const code = dto.code.trim().toLowerCase();
    const exists = await this.taskStatusesRepository.findOne({ where: { code } });

    if (exists) {
      throw new BadRequestException('Ya existe un estado con ese código');
    }

    const entity = this.taskStatusesRepository.create({
      code,
      nombre: dto.nombre.trim(),
      orden: dto.orden ?? 0,
      color: dto.color ?? '#64748b',
      isFinal: dto.isFinal ?? false,
    });

    return this.taskStatusesRepository.save(entity);
  }

  async findAll() {
    return this.taskStatusesRepository.find({
      where: { estado: true },
      order: { orden: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const status = await this.taskStatusesRepository.findOne({ where: { id, estado: true } });
    if (!status) {
      throw new NotFoundException('Estado de tarea no encontrado');
    }
    return status;
  }

  async findByCode(code: string) {
    const normalizedCode = code.trim().toLowerCase();
    const status = await this.taskStatusesRepository.findOne({
      where: { code: normalizedCode, estado: true },
    });

    if (!status) {
      throw new NotFoundException(`No existe el estado ${normalizedCode}`);
    }

    return status;
  }

  async update(id: string, dto: UpdateTaskStatusDto) {
    const status = await this.findOne(id);

    if (dto.code && dto.code.trim().toLowerCase() !== status.code) {
      const exists = await this.taskStatusesRepository.findOne({
        where: { code: dto.code.trim().toLowerCase() },
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException('Ya existe un estado con ese código');
      }

      status.code = dto.code.trim().toLowerCase();
    }

    if (dto.nombre !== undefined) status.nombre = dto.nombre.trim();
    if (dto.orden !== undefined) status.orden = dto.orden;
    if (dto.color !== undefined) status.color = dto.color;
    if (dto.isFinal !== undefined) status.isFinal = dto.isFinal;

    return this.taskStatusesRepository.save(status);
  }

  async remove(id: string) {
    const status = await this.findOne(id);
    status.estado = false;
    return this.taskStatusesRepository.save(status);
  }
}
