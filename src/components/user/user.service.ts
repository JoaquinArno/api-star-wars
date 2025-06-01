import {
  Injectable,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createSaltAndHash, genSalt } from '../../utils/hash.util';
import { User } from './entities/user.entity';
import { Auth } from '../auth/entities/auth.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { WinstonLogger as Logger } from '../../config/logger.config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly logger: Logger
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating user with email: ${createUserDto.email}`);

      const { email, password, ...userData } = createUserDto;

      if (!email) {
        this.logger.warn('User creation failed: Email is required');
        throw new BadRequestException('Email is required');
      }

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(
          `User creation conflict: Email ${email} already in use`
        );
        throw new ConflictException({
          message: 'Email already in use',
          code: 'EMAIL_ALREADY_IN_USE',
        });
      }

      const user = this.userRepository.create({
        email: email,
        role: createUserDto.role,
        ...userData,
      });

      const savedUser = await this.userRepository.save(user);

      const salt = await genSalt();
      const hashedPassword = await createSaltAndHash(password, salt);

      const auth = this.authRepository.create({
        password: hashedPassword,
        userId: savedUser,
      });

      await this.authRepository.save(auth);

      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      return savedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error creating user:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    this.logger.log(`Fetching user with email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(
    id: number,
    updateUserDto: Partial<UpdateUserDto>
  ): Promise<User> {
    try {
      this.logger.log(`Updating user with ID: ${id}`);

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        this.logger.warn(`User update failed: User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      Object.assign(user, updateUserDto);

      const updatedUser = await this.userRepository.save(user);

      this.logger.log(`User with ID ${id} updated successfully`);

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error updating user with ID ${id}`, error);
      throw new InternalServerErrorException('Error updating user');
    }
  }
}
