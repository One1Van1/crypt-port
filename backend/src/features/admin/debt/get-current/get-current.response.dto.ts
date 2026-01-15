import { ApiProperty } from '@nestjs/swagger';

export class GetCurrentDebtResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1000 })
  amountUsdt: number;

  constructor(id: number, amountUsdt: number) {
    this.id = id;
    this.amountUsdt = amountUsdt;
  }
}
