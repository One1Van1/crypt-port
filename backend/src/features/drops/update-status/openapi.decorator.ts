import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateDropStatusResponseDto } from './update-status.response.dto';

export const ApiUpdateDropStatus = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update drop status - activate/freeze (Admin/Teamlead only)' }),
    ApiOkResponse({
      description: 'Drop status successfully updated',
      type: UpdateDropStatusResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Drop not found',
    }),
  );
