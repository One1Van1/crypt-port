import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateTransactionV2ResponseDto } from './create-v2.response.dto';

export const ApiCreateTransactionV2 = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟢 [OPERATOR] Create withdrawal transaction v2 (platform -> neo-bank (history) -> bank account)',
      description:
        'Creates transaction using shift platform rate; deducts platform.balance (USDT), increases bank_accounts.withdrawn_amount (ARS), and writes neo_bank_withdrawals history. Does not rely on neo-bank currentBalance as a funding source.',
    }),
    ApiCreatedResponse({
      description: 'Transaction created successfully',
      type: CreateTransactionV2ResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'No active shift / insufficient platform balance / invalid bank account / invalid neo-bank',
    }),
    ApiNotFoundResponse({
      description: 'Bank account or neo-bank not found',
    }),
  );
