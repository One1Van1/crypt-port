import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { AdminUpdateUserRequestDto } from './update-user.request.dto';
import { AdminUpdateUserResponseDto } from './update-user.response.dto';

export const ApiAdminUpdateUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔐 [ADMIN] Update user (all fields)',
      description: 'Allows admin to update user fields: username, email, password, phone, telegram, role, status',
    }),
    ApiRolesAccess(UserRole.ADMIN),
    ApiParam({ name: 'id', required: true, example: 1 }),
    ApiBody({ type: AdminUpdateUserRequestDto }),
    ApiOkResponse({ type: AdminUpdateUserResponseDto }),
  );
