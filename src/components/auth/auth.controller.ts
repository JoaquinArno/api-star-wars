import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { signInDto } from './dto/signin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WinstonLogger } from '../../config/logger.config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: WinstonLogger
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      const auth = await this.authService.signup(createUserDto);
      this.logger.log('User registered successfully');
      return {
        message: 'User registered successfully',
        data: auth,
      };
    } catch (error) {
      this.logger.error('Signup failed', error);
      throw error;
    }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Body() signInDto: signInDto) {
    try {
      const token = await this.authService.signin(signInDto);
      this.logger.log('User signed in successfully');
      return {
        message: 'Signed in successfully',
        token,
      };
    } catch (error) {
      this.logger.error('Signin failed', error);
      throw error;
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async refreshToken(@Body('token') token: string) {
    try {
      const newToken = await this.authService.refreshToken(token);
      this.logger.log('Token refreshed successfully');
      return {
        message: 'Token refreshed successfully',
        token: newToken,
      };
    } catch (error) {
      this.logger.error('Refresh token failed', error);
      throw error;
    }
  }
}
