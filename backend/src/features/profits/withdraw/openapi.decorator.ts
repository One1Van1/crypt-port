import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { WithdrawProfitResponseDto } from './withdraw.response.dto';

export const ApiWithdrawProfit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Withdraw profit (Admin only)',
      description: 'Admin withdraws profit USDT at specified rate. Principal amount is returned to chosen section.',
    }),
    ApiOkResponse({
      description: 'Profit withdrawn successfully',
      type: WithdrawProfitResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid data or insufficient profit' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Only admin can perform this action' }),
  );
