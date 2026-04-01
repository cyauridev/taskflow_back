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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    const result = await this.usersService.findAll(Number(page), Number(limit));
    return {
      success: true,
      data: result.items,
      message: 'Usuarios obtenidos',
      meta: result.meta,
    };
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      success: true,
      data: user,
      message: 'Usuario creado correctamente',
    };
  }

  @Get('me')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.id, dto);
    return {
      success: true,
      data: user,
      message: 'Perfil actualizado',
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return {
      success: true,
      data: user,
      message: 'Usuario actualizado correctamente',
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const user = await this.usersService.softDelete(id);
    return {
      success: true,
      data: user,
      message: 'Usuario eliminado correctamente',
    };
  }
}
