import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateDropResponseDto } from './update.response.dto';

export const ApiUpdateDrop = () =>
  applyDecorators(
    ApiOperation({ summary: '🟡 [ADMIN, TEAMLEAD] Update drop information' }),
    ApiOkResponse({
      description: 'Drop successfully updated',
      type: UpdateDropResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Drop not found',
    }),
  );
