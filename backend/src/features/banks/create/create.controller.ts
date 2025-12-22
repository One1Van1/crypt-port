import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateBankService } from './create.service';
import { CreateBankRequestDto } from './create.request.dto';
import { CreateBankResponseDto } from './create.response.dto';
import { ApiCreateBank } from './openapi.decorator';

@Controller('banks')
@ApiTags('Banks')
export class CreateBankController {
  constructor(private readonly service: CreateBankService) {}

  @Post()
  @ApiCreateBank()
  async handle(@Body() dto: CreateBankRequestDto): Promise<CreateBankResponseDto> {
    return this.service.execute(dto);
  }
}
