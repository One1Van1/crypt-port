import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllTransactionsResponseDto } from './get-all.response.dto';

export const ApiGetAllTransactions = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get all transactions (Admin/Teamlead only)',
      description: 'Returns list of all transactions with comprehensive filters',
    }),
    ApiOkResponse({
      description: 'Transactions list',
      type: GetAllTransactionsResponseDto,
    }),
  );
