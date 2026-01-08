import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CreateUserRequestDto } from './create.request.dto';
import { CreateUserResponseDto } from './create.response.dto';

export const ApiCreateUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔐 [ADMIN] Create user and get QR setup token',
      description: 'Creates OPERATOR/TEAMLEAD user and returns tempToken to fetch QR code via /auth/qr-code',
    }),
    ApiRolesAccess(UserRole.ADMIN),
    ApiBody({ type: CreateUserRequestDto }),
    ApiCreatedResponse({
      description: 'User successfully created',
      type: CreateUserResponseDto,
    }),
  );
