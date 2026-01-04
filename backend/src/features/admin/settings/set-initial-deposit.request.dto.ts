import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetInitialDepositRequestDto {
  @ApiProperty({
    description: 'Initial deposit amount in USDT',
    example: 9500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  initialDeposit: number;
}
