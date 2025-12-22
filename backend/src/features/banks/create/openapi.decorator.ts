import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CreateBankResponseDto } from './create.response.dto';

export const ApiCreateBank = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🔴 [ADMIN] Create a new bank',
      description: 'Only ADMIN can create banks'
    }),
    ApiCreatedResponse({
      description: 'Bank successfully created',
      type: CreateBankResponseDto,
    }),
    ApiConflictResponse({
      description: 'Bank with this name already exists',
    }),
  );
