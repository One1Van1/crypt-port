import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetRequisiteV2ResponseDto } from './get-requisite-v2.response.dto';

export const ApiGetRequisiteV2 = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get requisite v2 (bank account + neo-banks for current shift platform)',
    }),
    ApiOkResponse({ type: GetRequisiteV2ResponseDto }),
  );
