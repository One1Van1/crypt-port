import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetBankByIdService } from './get-by-id.service';
import { GetBankByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetBankById } from './openapi.decorator';

@Controller('banks')
@ApiTags('Banks')
export class GetBankByIdController {
  constructor(private readonly service: GetBankByIdService) {}

  @Get(':id')
  @ApiGetBankById()
  async handle(@Param('id', ParseUUIDPipe) id: string): Promise<GetBankByIdResponseDto> {
    return this.service.execute(id);
  }
}
