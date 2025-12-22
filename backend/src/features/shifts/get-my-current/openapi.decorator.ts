import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetMyCurrentShiftResponseDto } from './get-my-current.response.dto';

export const ApiGetMyCurrentShift = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get my current active shift (Operator only)',
      description: 'Returns null if no active shift exists',
    }),
    ApiOkResponse({
      description: 'Current active shift or null',
      type: GetMyCurrentShiftResponseDto,
    }),
  );
