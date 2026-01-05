import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetOperatorsWithdrawalsResponseDto } from './get-operators-withdrawals.response.dto';

export const ApiGetOperatorsWithdrawals = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get operators cash withdrawals and conversions data' }),
    ApiOkResponse({ type: GetOperatorsWithdrawalsResponseDto }),
  );
