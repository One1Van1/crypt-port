import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiNoContentResponse } from '@nestjs/swagger';

export const ApiDeletePlatform = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a platform (soft delete)' }),
    ApiParam({ name: 'id', type: 'number', description: 'Platform ID' }),
    ApiNoContentResponse({ description: 'Platform deleted successfully' }),
  );
