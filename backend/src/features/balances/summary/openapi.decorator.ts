import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetBalancesSummaryResponseDto } from './summary.response.dto';

export const ApiGetBalancesSummary = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Get balances summary',
      description: 'Returns aggregated balances grouped by platform',
    }),
    ApiOkResponse({
      description: 'Balances summary',
      type: GetBalancesSummaryResponseDto,
    }),
  );
