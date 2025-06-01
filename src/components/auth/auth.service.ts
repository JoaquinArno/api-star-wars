import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { User } from '../user/entities/user.entity';
import { createSaltAndHash, genSalt } from '../../utils/hash.util';
import { verifyToken, createToken } from '../../utils/jwt.util';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { signInDto } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { WinstonLogger as Logger } from '../../config/logger.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly logger: Logger
  ) {}

  async signup(createAuthDto: CreateUserDto): Promise<Auth> {
    try {
      this.logger.log(`Signup attempt for email: ${createAuthDto.email}`);

      const { email, password } = createAuthDto;

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(
          `Signup warning: User with email ${email} already exists`
        );

        const existingAuth = await this.authRepository.findOne({
          where: { userId: { id: existingUser.id } },
        });

        if (existingAuth) {
          this.logger.warn(
            `Signup conflict: Auth record already exists for user ${email}`
          );
          throw new ConflictException(
            'Authentication record already exists for this user'
          );
        }

        this.logger.warn(
          `Signup conflict: User already exists without authentication for ${email}`
        );
        throw new ConflictException(
          'User already exists without authentication'
        );
      }

      const user = await this.userService.create(createAuthDto);

      const salt = await genSalt();
      const hashedPassword = await createSaltAndHash(password, salt);

      const auth = this.authRepository.create({
        userId: user,
        password: hashedPassword,
      });

      const savedAuth = await this.authRepository.save(auth);

      this.logger.log(`User signed up successfully with ID: ${user.id}`);

      return savedAuth;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error('Error signing up user:', error);
      throw new InternalServerErrorException('Error signing up user');
    }
  }

  async signin(signInDto: signInDto): Promise<string> {
    const { email, password } = signInDto;

    try {
      this.logger.log(`Signin attempt for email: ${email}`);

      const user = await this.userService.findOneByEmail(email);

      if (!user) {
        this.logger.warn(`Signin failed: User with email ${email} not found`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const auth = await this.authRepository.findOne({
        where: { userId: { id: user.id } },
        relations: ['userId'],
      });

      if (!auth) {
        this.logger.warn(
          `Signin failed: No auth record found for user ${email}`
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      const [salt] = auth.password.split(':');
      const hashedPassword = await createSaltAndHash(password, salt);

      if (hashedPassword !== auth.password) {
        this.logger.warn(`Signin failed: Invalid password for user ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = createToken({ id: auth.userId.id, role: auth.userId.role });

      this.logger.log(`User ${email} signed in successfully`);

      return token;
    } catch (error) {
      this.logger.error('Error during user sign in:', error);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Error during user sign in');
    }
  }

  async refreshToken(token: string): Promise<string> {
    try {
      this.logger.log('Refreshing token');

      const payload = verifyToken(token);

      if (!payload) {
        this.logger.warn('Refresh token failed: Invalid token');
        throw new UnauthorizedException('Invalid token');
      }

      const { id, role } = payload;
      const newToken = createToken({ id, role });

      this.logger.log('Token refreshed successfully');

      return newToken;
    } catch (error) {
      this.logger.error('Error refreshing token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
