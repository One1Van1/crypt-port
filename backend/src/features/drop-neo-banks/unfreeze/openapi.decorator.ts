import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UnfreezeDropNeoBankResponseDto } from './unfreeze.response.dto';

export const ApiUnfreezeDropNeoBank = () =>
  applyDecorators(
    ApiOperation({ summary: 'Unfreeze drop neo bank' }),
    ApiParam({ name: 'id', type: Number }),
    ApiOkResponse({ type: UnfreezeDropNeoBankResponseDto }),
  );
