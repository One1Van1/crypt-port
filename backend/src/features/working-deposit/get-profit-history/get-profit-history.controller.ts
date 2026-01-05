import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetProfitHistoryService } from './get-profit-history.service';
import { GetProfitHistoryQueryDto } from './get-profit-history.query.dto';
import { GetProfitHistoryResponseDto } from './get-profit-history.response.dto';
import { ApiGetProfitHistory } from './openapi.decorator';

@Controller('working-deposit')
@ApiTags('WorkingDeposit')
export class GetProfitHistoryController {
  constructor(private readonly service: GetProfitHistoryService) {}

  @Get('profit-history')
  @ApiGetProfitHistory()
  async handle(@Query() query: GetProfitHistoryQueryDto): Promise<GetProfitHistoryResponseDto> {
    return this.service.execute(query);
  }
}
