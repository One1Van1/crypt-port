import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiParam, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export const ApiDeleteBank = () =>
  applyDecorators(
    ApiOperation({ summary: 'Soft delete bank (only if no linked bank accounts)' }),
    ApiParam({ name: 'id', required: true, example: 1 }),
    ApiNoContentResponse({ description: 'Bank deleted' }),
    ApiBadRequestResponse({ description: 'Cannot delete bank with linked bank accounts' }),
    ApiNotFoundResponse({ description: 'Bank not found' }),
  );
