import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetOperatorsAnalyticsResponseDto } from './operators.response.dto';

export const ApiGetOperatorsAnalytics = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🔴 [ADMIN] Get operators analytics',
      description: 'Returns detailed statistics for all operators',
    }),
    ApiOkResponse({
      description: 'Operators analytics',
      type: GetOperatorsAnalyticsResponseDto,
    }),
  );
