import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateDropResponseDto } from './update.response.dto';

export const ApiUpdateDrop = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update drop information (Admin/Teamlead only)' }),
    ApiOkResponse({
      description: 'Drop successfully updated',
      type: UpdateDropResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Drop not found',
    }),
  );
