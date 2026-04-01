import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateProjectDto, currentUser: any) {
    const ownerId = dto.ownerId || currentUser.id;
    const owner = await this.usersService.findOne(ownerId);

    const entity = this.projectsRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      status: dto.status || 'active',
      owner,
      ownerId: owner.id,
    });

    return this.projectsRepository.save(entity);
  }

  async findAll(currentUser: any) {
    if (currentUser.role === Role.ADMIN) {
      return this.projectsRepository.find({
        where: { estado: true },
        relations: ['owner', 'tasks', 'tasks.assignedTo', 'tasks.statusConfig'],
        order: { createdAt: 'DESC' },
      });
    }

    if (currentUser.role === Role.PROJECT_MANAGER) {
      return this.projectsRepository.find({
        where: { ownerId: currentUser.id, estado: true },
        relations: ['owner', 'tasks', 'tasks.assignedTo', 'tasks.statusConfig'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.tasks', 'task', 'task.estado = true')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.statusConfig', 'statusConfig')
      .where('project.estado = true')
      .andWhere('assignedTo.id = :userId', { userId: currentUser.id })
      .orderBy('project.created_at', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    const project = await this.projectsRepository.findOne({
      where: { id, estado: true },
      relations: ['owner', 'tasks', 'tasks.assignedTo', 'tasks.statusConfig'],
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, currentUser: any) {
    const project = await this.findOne(id);

    if (
      currentUser.role === Role.PROJECT_MANAGER &&
      project.ownerId !== currentUser.id
    ) {
      throw new ForbiddenException('No puede editar este proyecto');
    }

    if (dto.ownerId) {
      const owner = await this.usersService.findOne(dto.ownerId);
      project.owner = owner;
      project.ownerId = owner.id;
    }

    project.nombre = dto.nombre ?? project.nombre;
    project.descripcion = dto.descripcion ?? project.descripcion;
    project.status = dto.status ?? project.status;

    return this.projectsRepository.save(project);
  }

  async archive(id: string) {
    const project = await this.findOne(id);
    project.status = 'archived';
    return this.projectsRepository.save(project);
  }

  async remove(id: string, currentUser: any) {
    const project = await this.findOne(id);

    if (
      currentUser.role === Role.PROJECT_MANAGER &&
      project.ownerId !== currentUser.id
    ) {
      throw new ForbiddenException('No puede eliminar este proyecto');
    }

    const activeTasks = (project.tasks || []).filter((task) => task.estado);

    if (activeTasks.length > 0) {
      throw new BadRequestException('No se puede eliminar el proyecto porque tiene tareas activas asociadas');
    }

    project.estado = false;
    project.status = 'archived';
    return this.projectsRepository.save(project);
  }
}
