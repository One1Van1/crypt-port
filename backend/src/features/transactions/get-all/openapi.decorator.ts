import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllTransactionsResponseDto } from './get-all.response.dto';

export const ApiGetAllTransactions = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Get all transactions',
      description: 'Returns list of all transactions with comprehensive filters',
    }),
    ApiOkResponse({
      description: 'Transactions list',
      type: GetAllTransactionsResponseDto,
    }),
  );
