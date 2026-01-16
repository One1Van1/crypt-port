import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchNeoBanksV3ResponseDto } from './search-neo-banks-v3.response.dto';

export const ApiSearchNeoBanksV3 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Search neo-banks for current platform (v3)' }),
    ApiOkResponse({ type: SearchNeoBanksV3ResponseDto }),
    ApiQuery({ name: 'search', required: false, example: 'yont' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 50 }),
  );
