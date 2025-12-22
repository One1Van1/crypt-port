import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { UpdateBankResponseDto } from './update.response.dto';

export const ApiUpdateBank = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🔴 [ADMIN] Update bank information',
      description: 'Only ADMIN can update banks'
    }),
    ApiOkResponse({
      description: 'Bank successfully updated',
      type: UpdateBankResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank not found',
    }),
    ApiConflictResponse({
      description: 'Bank with this name already exists',
    }),
  );
