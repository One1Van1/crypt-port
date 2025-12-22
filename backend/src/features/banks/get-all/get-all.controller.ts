import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllBanksService } from './get-all.service';
import { GetAllBanksQueryDto } from './get-all.query.dto';
import { GetAllBanksResponseDto } from './get-all.response.dto';
import { ApiGetAllBanks } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('banks')
@ApiTags('Banks')
@UseGuards(JwtAuthGuard)
export class GetAllBanksController {
  constructor(private readonly service: GetAllBanksService) {}

  @Get()
  @ApiGetAllBanks()
  async handle(@Query() query: GetAllBanksQueryDto): Promise<GetAllBanksResponseDto> {
    return this.service.execute(query);
  }
}
