import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetFreeUsdtDistributionsResponseDto } from './get-distributions.response.dto';

export const ApiGetFreeUsdtDistributions = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟣 [ADMIN, TEAMLEAD] Get Free USDT distribution history',
    }),
    ApiBearerAuth(),
    ApiRolesAccess(UserRole.ADMIN, UserRole.TEAMLEAD),
    ApiOkResponse({ type: GetFreeUsdtDistributionsResponseDto }),
  );
