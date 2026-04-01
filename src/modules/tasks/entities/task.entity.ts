import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Project } from '../../projects/entities/project.entity';
import { TaskStatus } from '../../task-statuses/entities/task-status.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tasks')
export class Task extends AbstractEntity {
  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ default: 'todo' })
  status: string;

  @ManyToOne(() => TaskStatus, (taskStatus) => taskStatus.tasks, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'status_id' })
  statusConfig: TaskStatus;

  @Column({ name: 'status_id', nullable: true })
  statusId?: string;

  @Column({ default: 'medium' })
  priority: string;

  @ManyToOne(() => Project, (project) => project.tasks, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @Column({ name: 'assigned_to' })
  assignedToId: string;

  @ManyToOne(() => User, (user) => user.createdTasks, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by' })
  createdById: string;

  @Column({ type: 'timestamp', nullable: true, name: 'due_date' })
  dueDate?: Date;
}
