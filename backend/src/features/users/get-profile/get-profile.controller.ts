import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { GetUserProfileService } from './get-profile.service';
import { GetUserProfileResponseDto } from './get-profile.response.dto';
import { ApiGetUserProfile } from './openapi.decorator';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetUserProfileController {
  constructor(private readonly service: GetUserProfileService) {}

  @Get('profile/:id')
  @ApiGetUserProfile()
  async handle(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetUserProfileResponseDto> {
    return this.service.execute(user, id);
  }
}
