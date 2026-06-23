import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { email, password, name } = createUserDto;

    const userExists = await this.userRepository.findOneBy({ email });
    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    const { password: _, ...result } = savedUser;
    return result;
  }

  async findOnePublic(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tools'], 
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result as User;
  }

  async findOrCreateByEmail(email: string, name: string): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email });
    if (existing) return existing;

    const hashedPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
    const newUser = this.userRepository.create({ email, name, password: hashedPassword });
    return this.userRepository.save(newUser);
  }

  async promoteToAdmin(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    
    user.role = UserRole.ADMIN; 
    
    const savedUser = await this.userRepository.save(user);
    
    const { password: _, ...result } = savedUser;
    return result as User;
  }
}