import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth, ApiNotFoundResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { UpdateUserRoleResponseDto } from './update-user-role.response.dto';

export const ApiUpdateUserRole = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔴 [ADMIN] Update user role',
      description: 'Update user role. Only accessible by admins.',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User role updated successfully',
      type: UpdateUserRoleResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiForbiddenResponse({
      description: 'Access denied. Admin role required.',
    }),
  );
