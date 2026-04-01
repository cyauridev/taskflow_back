import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('task_statuses')
export class TaskStatus extends AbstractEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  nombre: string;

  @Column({ default: 0 })
  orden: number;

  @Column({ default: '#64748b' })
  color: string;

  @Column({ default: false, name: 'is_final' })
  isFinal: boolean;

  @OneToMany(() => Task, (task) => task.statusConfig)
  tasks: Task[];
}
