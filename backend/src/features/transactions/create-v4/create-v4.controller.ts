import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { CreateTransactionV4Service } from './create-v4.service';
import { CreateTransactionV4RequestDto } from './create-v4.request.dto';
import { CreateTransactionV4ResponseDto } from './create-v4.response.dto';
import { ApiCreateTransactionV4 } from './openapi.decorator';

@Controller('transactions')
@ApiTags('CreateTransactionV4')
export class CreateTransactionV4Controller {
  constructor(private readonly service: CreateTransactionV4Service) {}

  @Post('v4')
  @UseGuards(JwtAuthGuard)
  @ApiCreateTransactionV4()
  async handle(
    @Body() dto: CreateTransactionV4RequestDto,
    @CurrentUser() user: User,
  ): Promise<CreateTransactionV4ResponseDto> {
    return this.service.execute(dto, user);
  }
}
