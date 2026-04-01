import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { ProjectsService } from '../projects/projects.service';
import { TaskStatusesService } from '../task-statuses/task-statuses.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
    private readonly taskStatusesService: TaskStatusesService,
  ) {}

  private async resolveStatus(input: { status?: string; statusId?: string }) {
    if (input.statusId) {
      const status = await this.taskStatusesService.findOne(input.statusId);
      return status;
    }

    if (input.status) {
      const status = await this.taskStatusesService.findByCode(input.status);
      return status;
    }

    return this.taskStatusesService.findByCode('todo');
  }

  async create(dto: CreateTaskDto, currentUser: any) {
    const project = await this.projectsService.findOne(dto.projectId);
    const assignedTo = await this.usersService.findOne(dto.assignedToId);
    const createdBy = await this.usersService.findOne(currentUser.id);
    const status = await this.resolveStatus(dto);

    const entity = this.tasksRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      status: status.code,
      statusConfig: status,
      statusId: status.id,
      priority: dto.priority || 'medium',
      project,
      projectId: project.id,
      assignedTo,
      assignedToId: assignedTo.id,
      createdBy,
      createdById: createdBy.id,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });

    return this.tasksRepository.save(entity);
  }

  async findAll(filters: any, currentUser: any) {
    const qb = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.statusConfig', 'statusConfig')
      .where('task.estado = true')
      .andWhere('project.estado = true')
      .andWhere('assignedTo.estado = true')
      .andWhere('createdBy.estado = true')
      .orderBy('COALESCE(statusConfig.orden, 999)', 'ASC')
      .addOrderBy('task.created_at', 'DESC');

    if (filters.status) qb.andWhere('task.status = :status', { status: filters.status });
    if (filters.statusId) qb.andWhere('task.status_id = :statusId', { statusId: filters.statusId });
    if (filters.priority) qb.andWhere('task.priority = :priority', { priority: filters.priority });
    if (filters.projectId) qb.andWhere('task.project_id = :projectId', { projectId: filters.projectId });
    if (filters.assignedToId) qb.andWhere('task.assigned_to = :assignedToId', { assignedToId: filters.assignedToId });

    if (currentUser.role === Role.DEVELOPER) {
      qb.andWhere('task.assigned_to = :userId', { userId: currentUser.id });
    }

    if (currentUser.role === Role.PROJECT_MANAGER) {
      qb.andWhere('project.owner_id = :ownerId', { ownerId: currentUser.id });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOne({ where: { id, estado: true } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, currentUser: any) {
    const task = await this.findOne(id);

    if (
      currentUser.role === Role.DEVELOPER &&
      task.assignedToId !== currentUser.id
    ) {
      throw new ForbiddenException('Solo puede editar tareas asignadas');
    }

    if (dto.assignedToId) {
      const assignedTo = await this.usersService.findOne(dto.assignedToId);
      task.assignedTo = assignedTo;
      task.assignedToId = assignedTo.id;
    }

    if (dto.projectId) {
      const project = await this.projectsService.findOne(dto.projectId);
      task.project = project;
      task.projectId = project.id;
    }

    if (dto.status || dto.statusId) {
      const status = await this.resolveStatus(dto);
      task.status = status.code;
      task.statusConfig = status;
      task.statusId = status.id;
    }

    Object.assign(task, {
      titulo: dto.titulo ?? task.titulo,
      descripcion: dto.descripcion ?? task.descripcion,
      priority: dto.priority ?? task.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
    });

    return this.tasksRepository.save(task);
  }

  async changeStatus(id: string, payload: { status?: string; statusId?: string }, currentUser: any) {
    return this.update(id, payload, currentUser);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    task.estado = false;
    return this.tasksRepository.save(task);
  }
}
