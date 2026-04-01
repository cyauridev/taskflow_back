import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.DEVELOPER)
  async create(@Body() dto: CreateTaskDto, @Req() req: any) {
    const task = await this.tasksService.create(dto, req.user);
    return {
      success: true,
      data: task,
      message: 'Tarea creada correctamente',
    };
  }

  @Get()
  async findAll(
    @Query('status') status: string,
    @Query('statusId') statusId: string,
    @Query('priority') priority: string,
    @Query('projectId') projectId: string,
    @Query('assignedToId') assignedToId: string,
    @Req() req: any,
  ) {
    const tasks = await this.tasksService.findAll({ status, statusId, priority, projectId, assignedToId }, req.user);
    return {
      success: true,
      data: tasks,
      message: 'Tareas obtenidas correctamente',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    return {
      success: true,
      data: task,
      message: 'Tarea obtenida correctamente',
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    const task = await this.tasksService.update(id, dto, req.user);
    return {
      success: true,
      data: task,
      message: 'Tarea actualizada correctamente',
    };
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('statusId') statusId: string,
    @Req() req: any,
  ) {
    const task = await this.tasksService.changeStatus(id, { status, statusId }, req.user);
    return {
      success: true,
      data: task,
      message: 'Estado de la tarea actualizado correctamente',
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async remove(@Param('id') id: string) {
    const task = await this.tasksService.remove(id);
    return {
      success: true,
      data: task,
      message: 'Tarea eliminada correctamente',
    };
  }
}
