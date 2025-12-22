import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateBalanceResponseDto } from './create.response.dto';

export const ApiCreateBalance = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Create new balance (Admin only)',
      description: 'Creates balance for platform. Each platform can have one balance per type',
    }),
    ApiCreatedResponse({
      description: 'Balance created successfully',
      type: CreateBalanceResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
    ApiBadRequestResponse({
      description: 'Balance of this type already exists for this platform',
    }),
  );
