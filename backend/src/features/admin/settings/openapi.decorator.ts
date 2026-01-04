import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { SetInitialDepositResponseDto } from './set-initial-deposit.response.dto';

export const ApiSetInitialDeposit = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Set initial working deposit',
      description: 'Admin sets the baseline working deposit amount in USDT for profit/deficit calculation',
    }),
    ApiOkResponse({ type: SetInitialDepositResponseDto }),
  );
