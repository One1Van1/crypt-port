import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllShiftsResponseDto } from './get-all.response.dto';

export const ApiGetAllShifts = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Get all shifts with filters',
      description: 'Returns list of shifts with filtering by status, operator, platform, and date range',
    }),
    ApiOkResponse({
      description: 'List of shifts',
      type: GetAllShiftsResponseDto,
    }),
  );
