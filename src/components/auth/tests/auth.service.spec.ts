import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as hashUtil from '../../../utils/hash.util';
import * as jwtUtil from '../../../utils/jwt.util';
import { Auth } from '../entities/auth.entity';
import { User } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { WinstonLogger } from '../../../config/logger.config';
import { Role } from '../../../enums/userRole.enum';
import { CreateUserDto } from '../../user/dto/create-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<UserService>;
  let jwtService: Partial<JwtService>;
  let authRepository: Partial<Repository<Auth>>;
  let userRepository: Partial<Repository<User>>;
  let mockLogger: Partial<WinstonLogger>;

  beforeEach(async () => {
    userService = {
      findOneByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    authRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: getRepositoryToken(Auth), useValue: authRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: WinstonLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should throw if user exists without auth', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: '123456',
        role: Role.User,
      };

      const existingUser = { id: 1, email: dto.email };

      (userRepository.findOne as jest.Mock).mockResolvedValue(existingUser);

      (authRepository.findOne as jest.Mock).mockResolvedValue({
        userId: existingUser,
      });

      await expect(service.signup(dto)).rejects.toThrow(ConflictException);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Signup warning: User with email test@example.com already exists'
        )
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Signup conflict: Auth record already exists for user test@example.com'
        )
      );
    });
  });

  describe('signin', () => {
    it('should return token if credentials are correct', async () => {
      const email = 'test@example.com';
      const password = 'test123';

      const user = { id: 1, email, role: Role.User };
      const salt = 'randomsalt';
      const hashedPassword = `${salt}:hashedpassword`;

      const auth = {
        userId: user,
        password: hashedPassword,
      };

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(user);
      (authRepository.findOne as jest.Mock).mockResolvedValue(auth);

      (
        jest.spyOn(hashUtil, 'createSaltAndHash') as jest.Mock
      ).mockResolvedValue(hashedPassword);

      jest.spyOn(jwtUtil, 'createToken').mockReturnValue('valid.token');

      const result = await service.signin({ email, password });

      expect(result).toEqual('valid.token');
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('User test@example.com signed in successfully')
      );
    });
  });
  describe('refreshToken', () => {
    it('should return a new token if the input token is valid', async () => {
      const oldToken = 'valid.token';
      const payload = { id: 1, role: Role.User };
      const newToken = 'new.valid.token';

      jest.spyOn(jwtUtil, 'verifyToken').mockReturnValue(payload);
      jest.spyOn(jwtUtil, 'createToken').mockReturnValue(newToken);

      const result = await service.refreshToken(oldToken);

      expect(result).toBe(newToken);
      expect(mockLogger.log).toHaveBeenCalledWith('Refreshing token');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Token refreshed successfully'
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const invalidToken = 'invalid.token';

      jest.spyOn(jwtUtil, 'verifyToken').mockReturnValue(null);

      await expect(service.refreshToken(invalidToken)).rejects.toThrow(
        UnauthorizedException
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Refresh token failed: Invalid token'
      );
    });

    it('should throw UnauthorizedException and log error if verifyToken throws', async () => {
      const token = 'crashing.token';

      jest.spyOn(jwtUtil, 'verifyToken').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(service.refreshToken(token)).rejects.toThrow(
        UnauthorizedException
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error refreshing token:',
        expect.any(Error)
      );
    });
  });
});
