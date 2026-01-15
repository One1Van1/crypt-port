import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCurrentDebtResponseDto } from './get-current.response.dto';

export const ApiGetCurrentDebt = () =>
  applyDecorators(
    ApiOperation({ summary: '🟣 [ADMIN, TEAMLEAD] Get current debt (USDT)' }),
    ApiOkResponse({ type: GetCurrentDebtResponseDto }),
  );
