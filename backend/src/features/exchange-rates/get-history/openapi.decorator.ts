import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetHistoryResponseDto } from './get-history.response.dto';

export const ApiGetHistory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get exchange rate history' }),
    ApiOkResponse({ type: GetHistoryResponseDto }),
    ApiBearerAuth(),
  );
