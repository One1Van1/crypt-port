import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WithdrawSimpleProfitResponseDto } from './withdraw-simple.response.dto';

export const ApiWithdrawSimpleProfit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Withdraw profit (simple, Admin only)',
      description: 'Admin withdraws profit USDT at specified rate. No principal redistribution is performed.',
    }),
    ApiOkResponse({
      description: 'Profit withdrawn successfully',
      type: WithdrawSimpleProfitResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Admin role required',
    }),
  );
