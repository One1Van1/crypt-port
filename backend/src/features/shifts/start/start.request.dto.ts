import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartShiftRequestDto {
  @ApiProperty({
    description: 'Platform ID where the operator will work',
    example: 1,
  })
  @IsNumber()
  platformId: number;
}
