import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustBalanceRequestDto {
  @ApiProperty({
    description: 'Amount to adjust (positive to add, negative to subtract)',
    example: 50000,
  })
  @IsNumber()
  adjustment: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Manual correction',
    required: false,
  })
  description?: string;
}
