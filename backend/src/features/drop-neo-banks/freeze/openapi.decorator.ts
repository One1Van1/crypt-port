import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { FreezeDropNeoBankResponseDto } from './freeze.response.dto';

export const ApiFreezeDropNeoBank = () =>
  applyDecorators(
    ApiOperation({ summary: 'Freeze drop neo bank and set frozen amount' }),
    ApiParam({ name: 'id', type: Number }),
    ApiOkResponse({ type: FreezeDropNeoBankResponseDto }),
  );
