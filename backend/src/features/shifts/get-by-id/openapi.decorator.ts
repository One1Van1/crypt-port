import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetShiftByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetShiftById = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Get shift by ID with transactions',
      description: 'Returns detailed shift information including all transactions',
    }),
    ApiOkResponse({
      description: 'Shift found',
      type: GetShiftByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Shift not found',
    }),
  );
