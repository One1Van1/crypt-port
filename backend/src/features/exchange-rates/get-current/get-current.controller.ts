import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetCurrentRateService } from './get-current.service';
import { ExchangeRateResponseDto } from '../set-rate/set-rate.response.dto';
import { ApiGetCurrentRate } from './openapi.decorator';

@Controller('exchange-rates')
@ApiTags('ExchangeRates')
export class GetCurrentRateController {
  constructor(private readonly service: GetCurrentRateService) {}

  @Get('current')
  @ApiGetCurrentRate()
  async handle(): Promise<ExchangeRateResponseDto> {
    return this.service.execute();
  }
}
