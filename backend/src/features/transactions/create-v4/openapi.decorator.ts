import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateTransactionV4RequestDto } from './create-v4.request.dto';
import { CreateTransactionV4ResponseDto } from './create-v4.response.dto';

export const ApiCreateTransactionV4 = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create transaction (v4) with concurrency-safe bankAccount locking',
    }),
    ApiBody({ type: CreateTransactionV4RequestDto }),
    ApiCreatedResponse({ type: CreateTransactionV4ResponseDto }),
  );
