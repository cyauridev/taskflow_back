import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { Role } from '../common/enums/role.enum';
import { TaskStatus } from '../modules/task-statuses/entities/task-status.entity';
import { User } from '../modules/users/entities/user.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { Task } from '../modules/tasks/entities/task.entity';

async function seed() {
  await dataSource.initialize();

  const statusRepo = dataSource.getRepository(TaskStatus);
  const userRepo = dataSource.getRepository(User);
  const projectRepo = dataSource.getRepository(Project);
  const taskRepo = dataSource.getRepository(Task);

  const count = await userRepo.count();
  if (count > 0) {
    console.log('Seed ya ejecutado.');
    await dataSource.destroy();
    return;
  }

  const statuses = await statusRepo.save([
    statusRepo.create({ code: 'todo', nombre: 'Por iniciar', orden: 1, color: '#64748b', isFinal: false }),
    statusRepo.create({ code: 'in_progress', nombre: 'En proceso', orden: 2, color: '#2563eb', isFinal: false }),
    statusRepo.create({ code: 'in_review', nombre: 'En revisión', orden: 3, color: '#d97706', isFinal: false }),
    statusRepo.create({ code: 'done', nombre: 'Culminado', orden: 4, color: '#16a34a', isFinal: true }),
  ]);

  const statusMap = Object.fromEntries(statuses.map((status) => [status.code, status]));

  const admin = userRepo.create({
    nombre: 'Admin User',
    email: 'admin@taskflow.com',
    password: await bcrypt.hash('Admin123!', 10),
    role: Role.ADMIN,
  });

  const maria = userRepo.create({
    nombre: 'María García',
    email: 'maria@taskflow.com',
    password: await bcrypt.hash('Maria123!', 10),
    role: Role.PROJECT_MANAGER,
  });

  const carlos = userRepo.create({
    nombre: 'Carlos López',
    email: 'carlos@taskflow.com',
    password: await bcrypt.hash('Carlos123!', 10),
    role: Role.DEVELOPER,
  });

  await userRepo.save([admin, maria, carlos]);

  const projectA = projectRepo.create({
    nombre: 'TaskFlow Web',
    descripcion: 'Implementación del panel web principal',
    status: 'active',
    owner: maria,
    ownerId: maria.id,
  });

  const projectB = projectRepo.create({
    nombre: 'TaskFlow Mobile Sync',
    descripcion: 'Sincronización de tareas para clientes móviles',
    status: 'archived',
    owner: admin,
    ownerId: admin.id,
  });

  await projectRepo.save([projectA, projectB]);

  const tasks = [
    taskRepo.create({
      titulo: 'Configurar autenticación',
      descripcion: 'Crear login y protección de rutas',
      status: 'done',
      statusConfig: statusMap.done,
      statusId: statusMap.done.id,
      priority: 'high',
      project: projectA,
      projectId: projectA.id,
      assignedTo: carlos,
      assignedToId: carlos.id,
      createdBy: maria,
      createdById: maria.id,
      dueDate: new Date(),
    }),
    taskRepo.create({
      titulo: 'CRUD de proyectos',
      descripcion: 'Implementar endpoints de proyectos',
      status: 'in_progress',
      statusConfig: statusMap.in_progress,
      statusId: statusMap.in_progress.id,
      priority: 'critical',
      project: projectA,
      projectId: projectA.id,
      assignedTo: carlos,
      assignedToId: carlos.id,
      createdBy: admin,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 86400000 * 2),
    }),
    taskRepo.create({
      titulo: 'Diseñar dashboard',
      descripcion: 'Mostrar resumen por estado',
      status: 'todo',
      statusConfig: statusMap.todo,
      statusId: statusMap.todo.id,
      priority: 'medium',
      project: projectA,
      projectId: projectA.id,
      assignedTo: maria,
      assignedToId: maria.id,
      createdBy: admin,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 86400000 * 5),
    }),
    taskRepo.create({
      titulo: 'Documentar API',
      descripcion: 'Integrar Swagger',
      status: 'in_review',
      statusConfig: statusMap.in_review,
      statusId: statusMap.in_review.id,
      priority: 'medium',
      project: projectB,
      projectId: projectB.id,
      assignedTo: maria,
      assignedToId: maria.id,
      createdBy: admin,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 86400000 * 3),
    }),
    taskRepo.create({
      titulo: 'Sembrar datos iniciales',
      descripcion: 'Crear usuarios, proyectos y tareas',
      status: 'done',
      statusConfig: statusMap.done,
      statusId: statusMap.done.id,
      priority: 'low',
      project: projectB,
      projectId: projectB.id,
      assignedTo: admin,
      assignedToId: admin.id,
      createdBy: admin,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 86400000),
    }),
  ];

  await taskRepo.save(tasks);

  console.log('Seed ejecutado correctamente.');
  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
