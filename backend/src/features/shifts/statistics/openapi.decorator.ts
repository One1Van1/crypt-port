import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetShiftsStatisticsResponseDto } from './statistics.response.dto';

export const ApiGetShiftsStatistics = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Get shifts statistics',
      description: 'Returns aggregated statistics for completed shifts with optional filters',
    }),
    ApiOkResponse({
      description: 'Shifts statistics',
      type: GetShiftsStatisticsResponseDto,
    }),
  );
