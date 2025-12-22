import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceRequestDto {
  @ApiProperty({
    description: 'New balance amount',
    example: 2000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}
