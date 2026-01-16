import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetReservationStatusV3ResponseDto } from './get-reservation-status-v3.response.dto';

export const ApiGetReservationStatusV3 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get requisite reservation status (who reserved and until when)' }),
    ApiOkResponse({ type: GetReservationStatusV3ResponseDto }),
    ApiQuery({ name: 'bankAccountId', required: true, example: 123 }),
  );
