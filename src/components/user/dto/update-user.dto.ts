import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../enums/userRole.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'updateduser@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Role of the user',
    enum: Role,
    example: Role.Admin,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'User password',
    example: 'newStrongPassword123',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
