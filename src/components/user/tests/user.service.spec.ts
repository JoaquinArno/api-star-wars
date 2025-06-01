import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Auth } from '../../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WinstonLogger } from '../../../config/logger.config';

jest.mock('../../../utils/hash.util', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  createSaltAndHash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let authRepository: Repository<Auth>;
  let logger: WinstonLogger;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAuthRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: mockAuthRepository,
        },
        {
          provide: WinstonLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    authRepository = module.get(getRepositoryToken(Auth));
    logger = module.get<WinstonLogger>(WinstonLogger);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      role: 1,
      password: 'password123',
    };

    it('should create a user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...dto });
      mockUserRepository.save.mockResolvedValue({ id: 1, ...dto });
      mockAuthRepository.create.mockReturnValue({});
      mockAuthRepository.save.mockResolvedValue({});

      const result = await service.create(dto);

      expect(result).toEqual({ id: 1, ...dto });
      expect(logger.log).toHaveBeenCalledWith(
        `Creating user with email: ${dto.email}`
      );
      expect(logger.log).toHaveBeenCalledWith(
        `User created successfully with ID: 1`
      );
    });

    it('should throw BadRequestException if email is missing', async () => {
      await expect(service.create({ ...dto, email: '' })).rejects.toThrow(
        BadRequestException
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User creation failed: Email is required'
      );
    });

    it('should throw ConflictException if user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        `User creation conflict: Email ${dto.email} already in use`
      );
    });

    it('should throw InternalServerErrorException on general error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('fail'));

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error creating user:',
        expect.any(Error)
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toBe(users);
      expect(logger.log).toHaveBeenCalledWith('Fetching all users');
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1 };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toBe(user);
      expect(logger.log).toHaveBeenCalledWith('Fetching user with ID: 1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith('User with ID 1 not found');
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneByEmail(user.email);
      expect(result).toBe(user);
      expect(logger.log).toHaveBeenCalledWith(
        `Fetching user with email: ${user.email}`
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByEmail('missing@example.com')
      ).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        'User with email missing@example.com not found'
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      email: 'updated@example.com',
    };

    it('should update the user', async () => {
      const user = { id: 1, email: 'old@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ id: 1, email: 'updated@example.com' });
      expect(logger.log).toHaveBeenCalledWith('Updating user with ID: 1');
      expect(logger.log).toHaveBeenCalledWith(
        'User with ID 1 updated successfully'
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User update failed: User with ID 1 not found'
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.save.mockRejectedValue(new Error('fail'));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error updating user with ID 1',
        expect.any(Error)
      );
    });
  });
});
