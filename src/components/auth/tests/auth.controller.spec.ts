import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { WinstonLogger } from '../../../config/logger.config';

describe('AuthController', () => {
  let controller: AuthController;
  let mockLogger: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    mockAuthService = {
      signup: jest.fn(),
      signin: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: WinstonLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return it', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: '12345678',
        role: 1,
      };
      const createdUser = { id: 1, ...createUserDto };
      const expectedResponse = {
        message: 'User registered successfully',
        data: createdUser,
      };

      mockAuthService.signup.mockResolvedValue(createdUser);

      const result = await controller.signup(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(createUserDto);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'User registered successfully'
      );
    });

    it('should throw error if signup fails', async () => {
      const error = new BadRequestException();
      mockAuthService.signup.mockRejectedValue(error);

      await expect(
        controller.signup({ email: 'bad', password: 'bad', role: 1 })
      ).rejects.toThrow(BadRequestException);
      expect(mockLogger.error).toHaveBeenCalledWith('Signup failed', error);
    });
  });

  describe('signin', () => {
    it('should return a JWT token', async () => {
      const signInDto = { email: 'test@example.com', password: '12345678' };
      const token = 'jwt.token.here';
      const expectedResponse = {
        message: 'Signed in successfully',
        token,
      };

      mockAuthService.signin.mockResolvedValue(token);

      const result = await controller.signin(signInDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signin).toHaveBeenCalledWith(signInDto);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'User signed in successfully'
      );
    });

    it('should throw error if signin fails', async () => {
      const error = new UnauthorizedException();
      mockAuthService.signin.mockRejectedValue(error);

      await expect(
        controller.signin({ email: 'test', password: 'bad' })
      ).rejects.toThrow(UnauthorizedException);
      expect(mockLogger.error).toHaveBeenCalledWith('Signin failed', error);
    });
  });

  describe('refreshToken', () => {
    it('should return a new token', async () => {
      const token = 'old.token.here';
      const newToken = 'new.token.here';
      const expectedResponse = {
        message: 'Token refreshed successfully',
        token: newToken,
      };

      mockAuthService.refreshToken.mockResolvedValue(newToken);

      const result = await controller.refreshToken(token);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(token);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Token refreshed successfully'
      );
    });

    it('should throw error if refresh token fails', async () => {
      const error = new UnauthorizedException();
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refreshToken('bad.token')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Refresh token failed',
        error
      );
    });
  });
});
