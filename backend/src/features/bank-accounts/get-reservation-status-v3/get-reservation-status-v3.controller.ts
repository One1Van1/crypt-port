import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiGetReservationStatusV3 } from './openapi.decorator';
import { GetReservationStatusV3QueryDto } from './get-reservation-status-v3.query.dto';
import { GetReservationStatusV3ResponseDto } from './get-reservation-status-v3.response.dto';
import { GetReservationStatusV3Service } from './get-reservation-status-v3.service';

@Controller('bank-accounts')
@ApiTags('GetReservationStatusV3')
export class GetReservationStatusV3Controller {
  constructor(private readonly service: GetReservationStatusV3Service) {}

  @Get('requisite-v3/reservation-status')
  @UseGuards(JwtAuthGuard)
  @ApiGetReservationStatusV3()
  async handle(@Query() query: GetReservationStatusV3QueryDto): Promise<GetReservationStatusV3ResponseDto> {
    return this.service.execute(query);
  }
}
