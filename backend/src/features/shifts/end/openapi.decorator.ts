import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiForbiddenResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { EndShiftResponseDto } from './end.response.dto';

export const ApiEndShift = () =>
  applyDecorators(
    ApiOperation({ summary: 'End active shift (Operator only)' }),
    ApiOkResponse({
      description: 'Shift successfully ended',
      type: EndShiftResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Shift not found',
    }),
    ApiForbiddenResponse({
      description: 'You can only end your own shifts',
    }),
    ApiBadRequestResponse({
      description: 'Shift is already ended',
    }),
  );
