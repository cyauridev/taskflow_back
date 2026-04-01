import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  assignedToId: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
