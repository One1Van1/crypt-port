import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';

import { CreateTransactionV3Service } from './create-v3.service';
import { CreateTransactionV3RequestDto } from './create-v3.request.dto';
import { CreateTransactionV3ResponseDto } from './create-v3.response.dto';
import { ApiCreateTransactionV3 } from './openapi.decorator';

@Controller('transactions')
@ApiTags('TransactionsV3')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateTransactionV3Controller {
  constructor(private readonly service: CreateTransactionV3Service) {}

  @Post('v3')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiCreateTransactionV3()
  async handle(
    @Body() dto: CreateTransactionV3RequestDto,
    @CurrentUser() user: User,
  ): Promise<CreateTransactionV3ResponseDto> {
    return this.service.execute(dto, user);
  }
}
