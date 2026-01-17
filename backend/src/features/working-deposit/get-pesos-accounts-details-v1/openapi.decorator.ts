import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetPesosAccountsDetailsV1ResponseDto } from './get-pesos-accounts-details-v1.response.dto';
import { PesosAccountsDetailsKind } from './get-pesos-accounts-details-v1.query.dto';

export const ApiGetPesosAccountsDetailsV1 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get pesos accounts details (with bank + drop names)' }),
    ApiOkResponse({ type: GetPesosAccountsDetailsV1ResponseDto }),
    ApiQuery({
      name: 'kind',
      required: true,
      enum: PesosAccountsDetailsKind,
      enumName: 'PesosAccountsDetailsKind',
      example: PesosAccountsDetailsKind.UNPAID,
    }),
  );
