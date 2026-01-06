import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WithdrawSimpleConfirmedProfitResponseDto } from './withdraw-simple-confirmed.response.dto';

export const ApiWithdrawSimpleConfirmedProfit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Withdraw profit from confirmed conversions (Admin only)',
      description:
        'Admin withdraws profit USDT at specified rate. Profit availability is based on CONFIRMED peso→USDT conversions only. No principal redistribution is performed.',
    }),
    ApiOkResponse({
      description: 'Profit withdrawn successfully',
      type: WithdrawSimpleConfirmedProfitResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Admin role required',
    }),
  );
