import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetMyShiftsResponseDto } from './get-my-shifts.response.dto';

export const ApiGetMyShifts = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my shifts (operator only sees their own shifts)' }),
    ApiOkResponse({ type: GetMyShiftsResponseDto }),
  );
