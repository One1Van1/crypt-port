import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserRole } from '../enums/user.enum';

/**
 * Декоратор для документирования ролей в Swagger
 * Показывает, какие роли имеют доступ к эндпойнту
 */
export const ApiRolesAccess = (...roles: UserRole[]) => {
  const rolesText = roles.length > 0 
    ? `🔐 **Access**: ${roles.join(', ')}`
    : '🔓 **Access**: Any authenticated user';

  return applyDecorators(
    ApiForbiddenResponse({
      description: `Access denied. ${rolesText}`,
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: `Access denied. Required roles: ${roles.join(', ')}. Your role: OPERATOR`,
          },
          error: {
            type: 'string',
            example: 'Forbidden',
          },
          statusCode: {
            type: 'number',
            example: 403,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or missing JWT token',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Unauthorized',
          },
          statusCode: {
            type: 'number',
            example: 401,
          },
        },
      },
    }),
  );
};
