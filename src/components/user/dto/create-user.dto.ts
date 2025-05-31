import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../enums/userRole.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: Role,
    example: Role.User,
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'User password, minimum 8 characters',
    minLength: 8,
    example: 'strongPassword123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
