import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetDropNeoBankFreezeHistoryResponseDto } from './get-freeze-history.response.dto';

export const ApiGetDropNeoBankFreezeHistory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get drop neo bank freeze/unfreeze history' }),
    ApiOkResponse({ type: GetDropNeoBankFreezeHistoryResponseDto }),
    ApiQuery({ name: 'neoBankId', type: Number, required: true }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
    ApiQuery({ name: 'offset', type: Number, required: false }),
  );
