import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDropNeoBankService } from './create.service';
import { CreateDropNeoBankRequestDto } from './create.request.dto';
import { CreateDropNeoBankResponseDto } from './create.response.dto';
import { ApiCreateDropNeoBank } from './openapi.decorator';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBanks')
export class CreateDropNeoBankController {
  constructor(private readonly service: CreateDropNeoBankService) {}

  @Post()
  @ApiCreateDropNeoBank()
  async handle(@Body() dto: CreateDropNeoBankRequestDto): Promise<CreateDropNeoBankResponseDto> {
    return this.service.execute(dto);
  }
}
