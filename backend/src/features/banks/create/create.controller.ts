import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBankService } from './create.service';
import { CreateBankRequestDto } from './create.request.dto';
import { CreateBankResponseDto } from './create.response.dto';
import { ApiCreateBank } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('banks')
@ApiTags('Banks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateBankController {
  constructor(private readonly service: CreateBankService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateBank()
  async handle(@Body() dto: CreateBankRequestDto): Promise<CreateBankResponseDto> {
    return this.service.execute(dto);
  }
}
