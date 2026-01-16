import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { ApiReleaseRequisiteV3 } from './openapi.decorator';
import { ReleaseRequisiteV3RequestDto } from './release-requisite-v3.request.dto';
import { ReleaseRequisiteV3Service } from './release-requisite-v3.service';

@Controller('bank-accounts')
@ApiTags('ReleaseRequisiteV3')
export class ReleaseRequisiteV3Controller {
  constructor(private readonly service: ReleaseRequisiteV3Service) {}

  @Post('requisite-v3/release')
  @UseGuards(JwtAuthGuard)
  @ApiReleaseRequisiteV3()
  async handle(
    @Body() dto: ReleaseRequisiteV3RequestDto,
    @CurrentUser() user: User,
  ): Promise<{ released: boolean }> {
    return this.service.execute(dto, user);
  }
}
