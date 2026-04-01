import { Column, Entity, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Role } from '../../../common/enums/role.enum';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @Column({ type: 'varchar' })
  role: Role;

  @Column({ nullable: true, name: 'avatar_url' })
  avatarUrl?: string;

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks: Task[];
}
