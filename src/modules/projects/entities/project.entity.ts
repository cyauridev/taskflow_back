import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('projects')
export class Project extends AbstractEntity {
  @Column()
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => User, (user) => user.ownedProjects, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
