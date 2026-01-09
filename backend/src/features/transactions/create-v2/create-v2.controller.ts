import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';

import { CreateTransactionV2Service } from './create-v2.service';
import { CreateTransactionV2RequestDto } from './create-v2.request.dto';
import { CreateTransactionV2ResponseDto } from './create-v2.response.dto';
import { ApiCreateTransactionV2 } from './openapi.decorator';

@Controller('transactions')
@ApiTags('TransactionsV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateTransactionV2Controller {
  constructor(private readonly service: CreateTransactionV2Service) {}

  @Post('v2')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiCreateTransactionV2()
  async handle(
    @Body() dto: CreateTransactionV2RequestDto,
    @CurrentUser() user: User,
  ): Promise<CreateTransactionV2ResponseDto> {
    return this.service.execute(dto, user);
  }
}
