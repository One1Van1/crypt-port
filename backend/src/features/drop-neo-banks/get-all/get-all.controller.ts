import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllDropNeoBanksService } from './get-all.service';
import { GetAllDropNeoBanksQueryDto } from './get-all.query.dto';
import { GetAllDropNeoBanksResponseDto } from './get-all.response.dto';
import { ApiGetAllDropNeoBanks } from './openapi.decorator';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBanks')
export class GetAllDropNeoBanksController {
  constructor(private readonly service: GetAllDropNeoBanksService) {}

  @Get()
  @ApiGetAllDropNeoBanks()
  async handle(@Query() query: GetAllDropNeoBanksQueryDto): Promise<GetAllDropNeoBanksResponseDto> {
    return this.service.execute(query);
  }
}
