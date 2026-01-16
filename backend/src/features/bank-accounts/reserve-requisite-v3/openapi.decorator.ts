import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ReserveRequisiteV3RequestDto } from './reserve-requisite-v3.request.dto';
import { ReserveRequisiteV3ResponseDto } from './reserve-requisite-v3.response.dto';

export const ApiReserveRequisiteV3 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Reserve requisite (bank account) to avoid operator collisions' }),
    ApiBody({ type: ReserveRequisiteV3RequestDto }),
    ApiCreatedResponse({ type: ReserveRequisiteV3ResponseDto }),
    ApiConflictResponse({ description: 'Requisite is reserved by another operator' }),
  );
