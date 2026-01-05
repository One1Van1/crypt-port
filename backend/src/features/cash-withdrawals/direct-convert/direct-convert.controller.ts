import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DirectConvertService } from './direct-convert.service';
import { DirectConvertDto } from './direct-convert.dto';
import { DirectConvertResponseDto } from './direct-convert.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiDirectConvert } from './openapi.decorator';

@Controller('cash-withdrawals')
@ApiTags('DirectConvert')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DirectConvertController {
  constructor(private readonly service: DirectConvertService) {}

  @Post('direct-convert')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiDirectConvert()
  async handle(
    @Body() dto: DirectConvertDto,
    @Request() req,
  ): Promise<DirectConvertResponseDto> {
    const userId = Number(req.user.userId || req.user.id);
    return this.service.execute(dto, userId);
  }
}
