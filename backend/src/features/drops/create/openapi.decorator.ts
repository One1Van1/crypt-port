import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { CreateDropResponseDto } from './create.response.dto';

export const ApiCreateDrop = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new drop (Admin/Teamlead only)' }),
    ApiCreatedResponse({
      description: 'Drop successfully created',
      type: CreateDropResponseDto,
    }),
  );
