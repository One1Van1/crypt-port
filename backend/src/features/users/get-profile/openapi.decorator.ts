import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetUserProfileResponseDto } from './get-profile.response.dto';

export const ApiGetUserProfile = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔐 Get user profile (self or ADMIN/TEAMLEAD)',
      description: 'Operators can only access their own profile. Admin/Teamlead can access any user profile by id.',
    }),
    ApiRolesAccess(UserRole.ADMIN, UserRole.TEAMLEAD, UserRole.OPERATOR),
    ApiParam({ name: 'id', required: true, example: 1 }),
    ApiOkResponse({ type: GetUserProfileResponseDto }),
  );
