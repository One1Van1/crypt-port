import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateTransactionV3RequestDto } from './create-v3.request.dto';
import { CreateTransactionV3ResponseDto } from './create-v3.response.dto';

export const ApiCreateTransactionV3 = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create transaction v3 (platform-funded; neo-bank as history, drop-agnostic)',
    }),
    ApiBody({ type: CreateTransactionV3RequestDto }),
    ApiCreatedResponse({ type: CreateTransactionV3ResponseDto }),
  );
