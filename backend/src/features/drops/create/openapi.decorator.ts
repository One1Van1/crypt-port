import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { CreateDropResponseDto } from './create.response.dto';

export const ApiCreateDrop = () =>
  applyDecorators(
    ApiOperation({ summary: '🟡 [ADMIN, TEAMLEAD] Create a new drop' }),
    ApiCreatedResponse({
      description: 'Drop successfully created',
      type: CreateDropResponseDto,
    }),
  );
