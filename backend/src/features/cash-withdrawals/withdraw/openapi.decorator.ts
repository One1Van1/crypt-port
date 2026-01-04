import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawCashResponseDto } from './withdraw-cash.response.dto';

export const ApiWithdrawCash = () =>
  applyDecorators(
    ApiOperation({ summary: 'Withdraw cash from bank (Admin/TeamLead)' }),
    ApiOkResponse({ type: WithdrawCashResponseDto }),
    ApiBearerAuth(),
  );
