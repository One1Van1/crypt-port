import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiConflictResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { StartShiftResponseDto } from './start.response.dto';

export const ApiStartShift = () =>
  applyDecorators(
    ApiOperation({ summary: 'Start a new shift (Operator only)' }),
    ApiCreatedResponse({
      description: 'Shift successfully started',
      type: StartShiftResponseDto,
    }),
    ApiConflictResponse({
      description: 'Operator already has an active shift',
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
  );
