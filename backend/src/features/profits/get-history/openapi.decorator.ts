import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { GetProfitHistoryResponseDto } from './get-history.response.dto';

export const ApiGetProfitHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get profit withdrawal history',
      description: 'Get list of all profit withdrawals (Admin and TeamLead)',
    }),
    ApiOkResponse({
      description: 'Profit history retrieved successfully',
      type: GetProfitHistoryResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Only admin and teamlead can access this' }),
  );
