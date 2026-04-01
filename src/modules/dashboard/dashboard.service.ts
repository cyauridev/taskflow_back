import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../common/enums/role.enum';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async summary(currentUser: any) {
    const qb = this.tasksRepository.createQueryBuilder('task')
      .leftJoin('task.project', 'project');

    if (currentUser.role === Role.DEVELOPER) {
      qb.andWhere('task.assigned_to = :userId', { userId: currentUser.id });
    }

    if (currentUser.role === Role.PROJECT_MANAGER) {
      qb.andWhere('project.owner_id = :ownerId', { ownerId: currentUser.id });
    }

    const tasks = await qb.getMany();

    const byStatus = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const upcoming = tasks
      .filter((task) => task.dueDate)
      .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
      .slice(0, 5);

    const recent = tasks
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 5);

    return {
      byStatus,
      upcoming,
      recent,
    };
  }
}
