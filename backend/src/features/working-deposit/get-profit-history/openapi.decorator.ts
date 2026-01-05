import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { GetProfitHistoryResponseDto } from './get-profit-history.response.dto';

export const ApiGetProfitHistory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get profit history by days' }),
    ApiOkResponse({ type: GetProfitHistoryResponseDto }),
    ApiQuery({ name: 'days', required: false, example: 30 }),
  );
