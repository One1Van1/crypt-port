import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllPlatformsService } from './get-all.service';
import { GetAllPlatformsQueryDto } from './get-all.query.dto';
import { GetAllPlatformsResponseDto } from './get-all.response.dto';
import { ApiGetAllPlatforms } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('platforms')
@ApiTags('Platforms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetAllPlatformsController {
  constructor(private readonly service: GetAllPlatformsService) {}

  @Get()
  @ApiGetAllPlatforms()
  async handle(@Query() query: GetAllPlatformsQueryDto): Promise<GetAllPlatformsResponseDto> {
    return this.service.execute(query);
  }
}
