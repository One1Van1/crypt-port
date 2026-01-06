import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { WithdrawSimpleLedgerProfitResponseDto } from './withdraw-simple-ledger.response.dto';

export const ApiWithdrawSimpleLedgerProfit = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟣 [ADMIN] Withdraw profit from Free USDT ledger',
      description:
        'Profit availability is based on (Free USDT ledger entries - profit withdrawals - distributions) minus initial_deposit.',
    }),
    ApiBearerAuth(),
    ApiRolesAccess(UserRole.ADMIN),
    ApiCreatedResponse({ type: WithdrawSimpleLedgerProfitResponseDto }),
  );
