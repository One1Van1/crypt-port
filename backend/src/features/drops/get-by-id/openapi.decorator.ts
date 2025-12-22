import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetDropByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetDropById = () =>
  applyDecorators(
    ApiOperation({ summary: '⚪ [ANY] Get drop by ID with bank accounts' }),
    ApiOkResponse({
      description: 'Drop found',
      type: GetDropByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Drop not found',
    }),
  );
