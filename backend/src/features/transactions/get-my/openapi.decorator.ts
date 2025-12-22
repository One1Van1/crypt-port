import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetMyTransactionsResponseDto } from './get-my.response.dto';

export const ApiGetMyTransactions = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get my transactions (Operator only)',
      description: 'Returns list of transactions for current operator with optional filters',
    }),
    ApiOkResponse({
      description: 'Transactions list',
      type: GetMyTransactionsResponseDto,
    }),
  );
