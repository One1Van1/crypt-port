import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { WithdrawSimpleLedgerV2ProfitResponseDto } from './withdraw-simple-ledger-v2.response.dto';

export const ApiWithdrawSimpleLedgerV2Profit = () =>
  applyDecorators(
    ApiOperation({ summary: 'Withdraw profit from today\'s profit reserve (ledger v2, rounding-safe)' }),
    ApiOkResponse({ type: WithdrawSimpleLedgerV2ProfitResponseDto }),
    ApiBadRequestResponse({ description: 'Not enough reserved profit to withdraw' }),
  );
