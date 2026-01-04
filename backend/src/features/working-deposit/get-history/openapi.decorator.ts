import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { GetWorkingDepositHistoryResponseDto } from './get-history.response.dto';

export const ApiGetWorkingDepositHistory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get working deposit history over time' }),
    ApiOkResponse({ type: GetWorkingDepositHistoryResponseDto }),
    ApiQuery({ name: 'days', required: false, example: 30, description: 'Number of days to look back (default: 30, max: 365)' }),
  );
