import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetGeneralStatsResponseDto } from './general.response.dto';

export const ApiGetGeneralStats = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get general system statistics (Admin/Teamlead only)',
      description: 'Returns overall system statistics',
    }),
    ApiOkResponse({
      description: 'General statistics',
      type: GetGeneralStatsResponseDto,
    }),
  );
