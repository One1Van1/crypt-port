import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOperatorsWithdrawalsService } from './get-operators-withdrawals.service';
import { GetOperatorsWithdrawalsResponseDto } from './get-operators-withdrawals.response.dto';
import { ApiGetOperatorsWithdrawals } from './openapi.decorator';

@Controller('analytics')
@ApiTags('GetOperatorsWithdrawals')
export class GetOperatorsWithdrawalsController {
  constructor(private readonly service: GetOperatorsWithdrawalsService) {}

  @Get('operators-withdrawals')
  @ApiGetOperatorsWithdrawals()
  async handle(): Promise<GetOperatorsWithdrawalsResponseDto> {
    return this.service.execute();
  }
}
