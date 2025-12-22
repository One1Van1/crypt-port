import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiNoContentResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export const ApiDeleteBalance = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🔴 [ADMIN] Delete balance',
      description: 'Soft deletes balance record',
    }),
    ApiNoContentResponse({
      description: 'Balance deleted successfully',
    }),
    ApiNotFoundResponse({
      description: 'Balance not found',
    }),
  );
