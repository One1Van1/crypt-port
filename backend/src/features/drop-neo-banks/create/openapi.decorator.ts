import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateDropNeoBankResponseDto } from './create.response.dto';

export const ApiCreateDropNeoBank = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create new neo bank account for drop' }),
    ApiCreatedResponse({ type: CreateDropNeoBankResponseDto }),
    ApiNotFoundResponse({ description: 'Drop not found' }),
    ApiBadRequestResponse({ description: 'Neo bank account already exists' }),
  );
