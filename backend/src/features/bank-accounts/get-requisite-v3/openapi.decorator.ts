import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetRequisiteV3ResponseDto } from './get-requisite-v3.response.dto';

export const ApiGetRequisiteV3 = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get requisite v3 (bank account + neo-banks remaining limits; can be negative)',
    }),
    ApiOkResponse({ type: GetRequisiteV3ResponseDto }),
  );
