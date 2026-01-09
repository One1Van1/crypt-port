import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ReserveProfitV2ResponseDto } from './reserve-profit-v2.response.dto';

export const ApiReserveProfitV2 = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'Reserve profit (v2) or record deficit = workingDeposit - initialDeposit; reserves profit by decreasing Free USDT',
    }),
    ApiOkResponse({ type: ReserveProfitV2ResponseDto }),
  );
