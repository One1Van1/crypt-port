import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceRequestDto {
  @ApiProperty({
    description: 'New balance amount in ARS',
    example: 500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  balance: number;
}
