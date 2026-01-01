import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user.enum';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Иерархия ролей: ADMIN > TEAMLEAD > OPERATOR
    const hasRole = requiredRoles.some((role) => {
      if (user.role === UserRole.ADMIN) {
        return true; // Админ может всё
      }
      if (user.role === UserRole.TEAMLEAD) {
        // Тимлид может всё что может оператор + свои права
        return role === UserRole.TEAMLEAD || role === UserRole.OPERATOR;
      }
      // Оператор только свои права
      return user.role === role;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
