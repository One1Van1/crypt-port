import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { DistributeFreeUsdtResponseDto } from './distribute.response.dto';

export const ApiDistributeFreeUsdt = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟣 [ADMIN] Distribute Free USDT to a platform (principal only)',
      description:
        'Decreases Free USDT balance and increases platform.balance. Distribution cannot consume profit portion (above initial_deposit).',
    }),
    ApiBearerAuth(),
    ApiRolesAccess(UserRole.ADMIN),
    ApiCreatedResponse({ type: DistributeFreeUsdtResponseDto }),
  );
