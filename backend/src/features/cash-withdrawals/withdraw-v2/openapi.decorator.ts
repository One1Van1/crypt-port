import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { WithdrawCashV2ResponseDto } from './withdraw-cash-v2.response.dto';

export const ApiWithdrawCashV2 = () =>
  applyDecorators(
    ApiOperation({ summary: '🟣 [ADMIN, TEAMLEAD] Withdraw cash with manual exchange rate (v2)' }),
    ApiOkResponse({ type: WithdrawCashV2ResponseDto }),
  );
