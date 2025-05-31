import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../guards/jwtAuth.guard';
import { ExecutionContext } from '@nestjs/common';
import { WinstonLogger } from '../../../config/logger.config';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let logger: WinstonLogger;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockLogger: Partial<WinstonLogger> = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (_context: ExecutionContext) => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: WinstonLogger, useValue: mockLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    logger = module.get<WinstonLogger>(WinstonLogger);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should log and call userService.create', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        role: 1,
        password: 'secret',
      };
      const createdUser = { id: 1, ...dto };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await controller.create(dto);

      expect(logger.log).toHaveBeenCalledWith('Creating new user');
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should log and call userService.findAll', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(logger.log).toHaveBeenCalledWith('Fetching all users');
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should log and call userService.findOne', async () => {
      const user = { id: 1 };
      mockUserService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(1);

      expect(logger.log).toHaveBeenCalledWith('Fetching user with id 1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should log and call userService.update', async () => {
      const dto: UpdateUserDto = { email: 'updated@example.com' };
      const updatedUser = { id: 1, ...dto };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, dto);

      expect(logger.log).toHaveBeenCalledWith('Updating user with id 1');
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedUser);
    });
  });
});
