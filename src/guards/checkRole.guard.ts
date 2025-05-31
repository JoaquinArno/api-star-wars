import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '../utils/jwt.util';
import { Role } from '../enums/userRole.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler()
    );
    if (!allowedRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token not found');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const userRole = payload.role || Role.User;
    if (!allowedRoles.includes(userRole)) {
      throw new UnauthorizedException(
        'You do not have enough permissions to access'
      );
    }

    return true;
  }
}
