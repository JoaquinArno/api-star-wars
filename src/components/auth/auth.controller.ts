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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signup(@Body() createUserDto: CreateUserDto) {
    const auth = await this.authService.signup(createUserDto);
    return {
      message: 'User registered successfully',
      data: auth,
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Body() signInDto: signInDto) {
    const token = await this.authService.signin(signInDto);
    return {
      message: 'Signed in successfully',
      token,
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async refreshToken(@Body('token') token: string) {
    const newToken = await this.authService.refreshToken(token);
    return {
      message: 'Token refreshed successfully',
      token: newToken,
    };
  }
}
