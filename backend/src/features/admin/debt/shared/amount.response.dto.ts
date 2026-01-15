import { ApiProperty } from '@nestjs/swagger';

export class DebtAmountChangeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 500 })
  amountUsdt: number;

  @ApiProperty({ example: -100, description: 'Applied delta (positive increases debt; negative decreases debt)' })
  deltaUsdt: number;

  constructor(id: number, amountUsdt: number, deltaUsdt: number) {
    this.id = id;
    this.amountUsdt = amountUsdt;
    this.deltaUsdt = deltaUsdt;
  }
}
