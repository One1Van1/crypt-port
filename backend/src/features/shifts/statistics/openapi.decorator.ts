import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetShiftsStatisticsResponseDto } from './statistics.response.dto';

export const ApiGetShiftsStatistics = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get shifts statistics (Admin/Teamlead only)',
      description: 'Returns aggregated statistics for completed shifts with optional filters',
    }),
    ApiOkResponse({
      description: 'Shifts statistics',
      type: GetShiftsStatisticsResponseDto,
    }),
  );
