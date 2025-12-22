import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetTransactionsStatsResponseDto } from './stats.response.dto';

export const ApiGetTransactionsStats = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get transactions statistics (Admin/Teamlead only)',
      description: 'Returns aggregated statistics for transactions with optional filters',
    }),
    ApiOkResponse({
      description: 'Transactions statistics',
      type: GetTransactionsStatsResponseDto,
    }),
  );
