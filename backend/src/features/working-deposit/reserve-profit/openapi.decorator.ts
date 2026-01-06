import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ReserveProfitResponseDto } from './reserve-profit.response.dto';

export const ApiReserveProfit = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'Reserve profit (or record deficit) = workingDeposit - initialDeposit; reserves profit by decreasing Free USDT',
    }),
    ApiOkResponse({ type: ReserveProfitResponseDto }),
  );
