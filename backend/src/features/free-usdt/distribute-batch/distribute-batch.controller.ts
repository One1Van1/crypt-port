import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiDistributeFreeUsdtBatch } from './openapi.decorator';
import { DistributeFreeUsdtBatchRequestDto } from './distribute-batch.request.dto';
import { DistributeFreeUsdtBatchResponseDto } from './distribute-batch.response.dto';
import { DistributeFreeUsdtBatchService } from './distribute-batch.service';

@Controller('free-usdt')
@ApiTags('DistributeFreeUsdtBatch')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DistributeFreeUsdtBatchController {
  constructor(private readonly service: DistributeFreeUsdtBatchService) {}

  @Post('distribute-batch')
  @Roles(UserRole.ADMIN)
  @ApiDistributeFreeUsdtBatch()
  async handle(
    @Body() dto: DistributeFreeUsdtBatchRequestDto,
    @CurrentUser() user: User,
  ): Promise<DistributeFreeUsdtBatchResponseDto> {
    return this.service.execute(dto, user);
  }
}
