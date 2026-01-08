import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AdminEndShiftResponseDto } from './end-shift.response.dto';

export const ApiAdminEndShift = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Admin: end any active shift' }),
    ApiParam({ name: 'id', description: 'Shift ID' }),
    ApiOkResponse({ type: AdminEndShiftResponseDto }),
  );
