import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ReleaseRequisiteV3RequestDto } from './release-requisite-v3.request.dto';

class ReleaseRequisiteV3ResponseDto {
  released: boolean;
}

export const ApiReleaseRequisiteV3 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Release requisite reservation' }),
    ApiBody({ type: ReleaseRequisiteV3RequestDto }),
    ApiOkResponse({ type: ReleaseRequisiteV3ResponseDto }),
  );
