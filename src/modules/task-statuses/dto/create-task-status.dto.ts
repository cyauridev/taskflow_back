import { IsBoolean, IsHexColor, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTaskStatusDto {
  @IsString()
  code: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;
}
