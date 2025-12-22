import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CreateBankResponseDto } from './create.response.dto';

export const ApiCreateBank = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new bank' }),
    ApiCreatedResponse({
      description: 'Bank successfully created',
      type: CreateBankResponseDto,
    }),
    ApiConflictResponse({
      description: 'Bank with this name already exists',
    }),
  );
