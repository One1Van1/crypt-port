import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { ApiReserveRequisiteV3 } from './openapi.decorator';
import { ReserveRequisiteV3RequestDto } from './reserve-requisite-v3.request.dto';
import { ReserveRequisiteV3ResponseDto } from './reserve-requisite-v3.response.dto';
import { ReserveRequisiteV3Service } from './reserve-requisite-v3.service';

@Controller('bank-accounts')
@ApiTags('ReserveRequisiteV3')
export class ReserveRequisiteV3Controller {
  constructor(private readonly service: ReserveRequisiteV3Service) {}

  @Post('requisite-v3/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiReserveRequisiteV3()
  async handle(
    @Body() dto: ReserveRequisiteV3RequestDto,
    @CurrentUser() user: User,
  ): Promise<ReserveRequisiteV3ResponseDto> {
    return this.service.execute(dto, user);
  }
}
