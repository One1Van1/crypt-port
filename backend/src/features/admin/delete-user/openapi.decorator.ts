import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

export const ApiAdminDeleteUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔴 [ADMIN] Delete user',
      description: 'Soft deletes user',
    }),
    ApiNoContentResponse({
      description: 'User deleted successfully',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
  );
