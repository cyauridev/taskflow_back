import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const exists = await this.findByEmail(normalizedEmail);

    if (exists) {
      throw new BadRequestException('El email ya está registrado');
    }

    const isPasswordHashed = /^\$2[aby]\$\d{2}\$/.test(dto.password);

    const entity = this.usersRepository.create({
      nombre: dto.nombre.trim(),
      email: normalizedEmail,
      password: isPasswordHashed ? dto.password : await bcrypt.hash(dto.password, 10),
      role: dto.role,
      avatarUrl: dto.avatarUrl,
    });

    return this.usersRepository.save(entity);
  }

  async findAll(page = 1, limit = 10) {
    const [items, total] = await this.usersRepository.findAndCount({
      where: { estado: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id, estado: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase(), estado: true } as FindOptionsWhere<User>,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      const exists = await this.findByEmail(dto.email.trim().toLowerCase());
      if (exists && exists.id !== id) {
        throw new BadRequestException('El email ya está registrado');
      }
      user.email = dto.email.trim().toLowerCase();
    }

    if (dto.nombre !== undefined) user.nombre = dto.nombre.trim();
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);

    return this.usersRepository.save(user);
  }

  async softDelete(id: string) {
    const user = await this.findOne(id);
    user.estado = false;
    return this.usersRepository.save(user);
  }
}
