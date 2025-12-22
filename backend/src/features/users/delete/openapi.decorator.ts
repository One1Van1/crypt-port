import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiNoContentResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export const ApiDeleteUser = () =>
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
