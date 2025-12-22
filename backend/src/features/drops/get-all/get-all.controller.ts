import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllDropsService } from './get-all.service';
import { GetAllDropsQueryDto } from './get-all.query.dto';
import { GetAllDropsResponseDto } from './get-all.response.dto';
import { ApiGetAllDrops } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('drops')
@ApiTags('Drops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetAllDropsController {
  constructor(private readonly service: GetAllDropsService) {}

  @Get()
  @ApiGetAllDrops()
  async handle(@Query() query: GetAllDropsQueryDto): Promise<GetAllDropsResponseDto> {
    return this.service.execute(query);
  }
}
